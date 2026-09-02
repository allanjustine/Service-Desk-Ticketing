<?php

use App\Models\Ticket;
use App\Models\TicketAttachment;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

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
        'urgent' => true,
    ]);

    $ticket = Ticket::first();

    $response->assertRedirect(route('tickets.show', $ticket));
    expect($ticket)
        ->requester_name->toBe('Jamie Cruz')
        ->user_id->toBe($user->id)
        ->status->toBe('pending')
        ->urgent->toBeTrue();
});

test('urgent tickets appear before regular tickets', function () {
    $itUser = User::factory()->create(['is_it' => true]);
    $regularTicket = Ticket::factory()->create([
        'urgent' => false,
        'created_at' => now()->addMinute(),
    ]);
    $urgentTicket = Ticket::factory()->create([
        'urgent' => true,
        'created_at' => now(),
    ]);

    $response = $this->actingAs($itUser)->get(route('tickets.index'));

    $response->assertInertia(fn ($page) => $page
        ->where('tickets.0.id', $urgentTicket->id)
        ->where('tickets.1.id', $regularTicket->id));
});

test('a user can delete their own ticket', function () {
    $user = User::factory()->create();
    $ticket = Ticket::factory()->for($user)->create();

    $response = $this->actingAs($user)->delete(route('tickets.destroy', $ticket));

    $response->assertRedirect(route('tickets.index'));
    expect(Ticket::find($ticket->id))->toBeNull();
});

test('a user cannot delete another users ticket', function () {
    $user = User::factory()->create();
    $ticket = Ticket::factory()->create();

    $response = $this->actingAs($user)->delete(route('tickets.destroy', $ticket));

    $response->assertForbidden();
    expect(Ticket::find($ticket->id))->not->toBeNull();
});

test('a user can uncheck urgency on their own ticket', function () {
    $user = User::factory()->create();
    $ticket = Ticket::factory()->for($user)->create(['urgent' => true]);

    $response = $this->actingAs($user)->patch(route('tickets.update-urgency', $ticket), [
        'urgent' => false,
    ]);

    $response->assertRedirect();
    expect($ticket->refresh()->urgent)->toBeFalse();
});

test('a user cannot change urgency on another users ticket', function () {
    $user = User::factory()->create();
    $ticket = Ticket::factory()->create(['urgent' => true]);

    $response = $this->actingAs($user)->patch(route('tickets.update-urgency', $ticket), [
        'urgent' => false,
    ]);

    $response->assertForbidden();
    expect($ticket->refresh()->urgent)->toBeTrue();
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

test('a ticket can store uploaded attachments', function () {
    Storage::fake('public');
    $user = User::factory()->create();
    $file = UploadedFile::fake()->image('screenshot.png', 1200, 800);

    $response = $this->actingAs($user)->post(route('tickets.store'), [
        'requester_name' => 'Jamie Cruz',
        'branch_name' => 'North Branch',
        'branch_code' => 'NB-01',
        'concern' => 'Computer / Laptop',
        'concern_description' => 'The workstation cannot connect to the shared drive.',
        'anydesk_id' => '123456789',
        'urgent' => false,
        'attachments' => [$file],
    ]);

    $response->assertRedirect();
    $ticket = Ticket::first();

    expect($ticket)->not->toBeNull();
    expect($ticket->attachments)->toHaveCount(1);
    expect(TicketAttachment::first()->original_name)->toBe('screenshot.png');

    Storage::disk('public')->assertExists(TicketAttachment::first()->file_name);
});
