<?php

use App\Models\Ticket;
use App\Models\User;

test('an authenticated user can submit a valid support ticket', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $response = $this->post(route('tickets.store'), [
        'requester_name' => 'Jamie Cruz',
        'branch_name' => 'North Branch',
        'branch_code' => 'NB-01',
        'concern' => 'Others',
        'concern_description' => 'The workstation cannot connect to the shared drive.',
        'anydesk_id' => '123456789',
    ]);

    $ticket = Ticket::first();

    $response->assertRedirect(route('tickets.show', $ticket));
    expect($ticket)
        ->requester_name->toBe('Jamie Cruz')
        ->user_id->toBe($user->id)
        ->status->toBe('pending');
});

test('ticket submission validates required fields and anydesk format', function () {
    $this->actingAs(User::factory()->create());

    $response = $this->post(route('tickets.store'), [
        'requester_name' => '',
        'concern' => 'Not a real concern',
        'concern_description' => 'Short',
        'anydesk_id' => 'ABC-123',
    ]);

    $response->assertSessionHasErrors([
        'requester_name',
        'branch_name',
        'branch_code',
        'concern',
        'concern_description',
        'anydesk_id',
    ]);
    expect(Ticket::count())->toBe(0);
});

test('IT can update a ticket status and resolution notes', function () {
    $itUser = User::factory()->create(['is_it' => true]);
    $ticket = Ticket::factory()->create();
    $this->actingAs($itUser);

    $response = $this->patch(route('tickets.update-status', $ticket), [
        'status' => 'solved',
        'resolution_notes' => 'Reconnected the workstation to the shared drive.',
    ]);

    $response->assertRedirect();
    expect($ticket->refresh())
        ->status->toBe('solved')
        ->resolution_notes->toBe('Reconnected the workstation to the shared drive.');
});

test('a user only sees their own tickets', function () {
    $user = User::factory()->create();
    Ticket::factory()->create(['user_id' => $user->id]);
    Ticket::factory()->create();

    $response = $this->actingAs($user)->get(route('tickets.index'));

    $response->assertOk()->assertInertia(fn ($page) => $page
        ->component('tickets/index')
        ->has('tickets', 1)
        ->where('isIt', false));
});

test('a regular user cannot update ticket status', function () {
    $ticket = Ticket::factory()->create();

    $response = $this->actingAs(User::factory()->create())->patch(route('tickets.update-status', $ticket), [
        'status' => 'solved',
    ]);

    $response->assertForbidden();
});
