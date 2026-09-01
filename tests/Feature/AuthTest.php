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

    $response->assertRedirect(route('tickets.index'));
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

test('it admins can view the dashboard with ticket and user totals', function () {
    $admin = User::factory()->create(['is_it' => true]);
    User::factory()->count(2)->create();
    $pending = \App\Models\Ticket::factory()->create(['status' => 'pending', 'user_id' => $admin->id]);
    \App\Models\Ticket::factory()->create(['status' => 'accepted', 'user_id' => $admin->id]);
    \App\Models\Ticket::factory()->create(['status' => 'solved', 'user_id' => $admin->id]);

    $this->actingAs($admin)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn($page) => $page
            ->where('stats.total_tickets', 3)
            ->where('stats.total_users', 3)
            ->where('stats.statuses.pending', 1)
            ->where('stats.statuses.accepted', 1)
            ->where('stats.statuses.solved', 1)
            ->where('stats.statuses.needs_travel', 0));
});
