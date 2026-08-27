<?php

use App\Models\User;
use Illuminate\Support\Facades\Hash;

test('guests are sent to login before accessing tickets', function () {
    $this->get(route('tickets.create'))->assertRedirect(route('login'));
});

test('a user can register and is logged in', function () {
    $response = $this->post(route('register.store'), [
        'name' => 'Jamie Cruz',
        'email' => 'jamie@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
        'branch_name' => 'North Branch',
        'branch_code' => 'NB-01',
    ]);

    $response->assertRedirect(route('tickets.create'));
    $this->assertAuthenticated();
    expect(User::where('email', 'jamie@example.com')->exists())->toBeTrue();
});

test('a user can log in and log out', function () {
    $user = User::factory()->create(['password' => Hash::make('password123')]);

    $this->post(route('login.store'), [
        'email' => $user->email,
        'password' => 'password123',
    ])->assertRedirect(route('tickets.index'));

    $this->assertAuthenticatedAs($user);
    $this->post(route('logout'))->assertRedirect(route('login'));
    $this->assertGuest();
});
