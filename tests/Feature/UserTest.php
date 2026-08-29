<?php

use App\Models\Ticket;
use App\Models\User;

test('IT can view users with their total ticket requests', function () {
    $itUser = User::factory()->create(['is_it' => true]);
    $user = User::factory()->create();
    Ticket::factory()->count(2)->for($user)->create();
    User::factory()->create(['is_it' => true]);

    $response = $this->actingAs($itUser)->get(route('users.index'));

    $response->assertInertia(fn ($page) => $page
        ->component('users/index')
        ->has('users', 1)
        ->where('users.0.id', $user->id)
        ->where('users.0.tickets_count', 2));
});

test('IT can view all requests for a user', function () {
    $itUser = User::factory()->create(['is_it' => true]);
    $user = User::factory()->create();
    Ticket::factory()->count(2)->for($user)->create();

    $response = $this->actingAs($itUser)->get(route('users.tickets', $user));

    $response->assertInertia(fn ($page) => $page
        ->component('users/tickets')
        ->where('user.id', $user->id)
        ->has('tickets', 2));
});

test('regular users cannot view the users directory', function () {
    $response = $this->actingAs(User::factory()->create())->get(route('users.index'));

    $response->assertForbidden();
});

test('IT cannot view requests for another IT user', function () {
    $itUser = User::factory()->create(['is_it' => true]);
    $otherItUser = User::factory()->create(['is_it' => true]);

    $response = $this->actingAs($itUser)->get(route('users.tickets', $otherItUser));

    $response->assertNotFound();
});
