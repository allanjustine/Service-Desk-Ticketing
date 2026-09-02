<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTicketRequest;
use App\Models\Ticket;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class TicketController extends Controller
{
    public function create()
    {
        $user = Auth::user();

        if ($user->is_it) {
            return to_route('tickets.index');
        }

        return Inertia::render('tickets/create', compact('user'));
    }

    public function store(StoreTicketRequest $request): RedirectResponse
    {
        do {
            $ticket_code = Str::of('SMCT-')
                ->append(Str::random(8))
                ->upper();
        } while (Ticket::query()->where('ticket_code', $ticket_code)->exists());

        $validated = $request->validated();

        $ticket = Auth::user()->tickets()->create([
            ...Arr::except($validated, ['urgent', 'attachments']),
            'ticket_code' => $ticket_code,
            'urgent' => $validated['urgent'] === 'true' ? true : false,
        ]);

        $attachment_data = [];

        foreach ($request->file('attachments', []) as $attachmentFile) {
            $storedName = Str::uuid()->toString() . '.' . $attachmentFile->getClientOriginalExtension();

            $path = $attachmentFile->storeAs('ticket-attachments', $storedName, 'public');

            $attachment_data[] = [
                'original_name' => $attachmentFile->getClientOriginalName(),
                'file_name' => $path,
                'mime_type' => $attachmentFile->getClientMimeType(),
                'size' => $attachmentFile->getSize(),
            ];
        }

        $ticket->attachments()->createMany($attachment_data);

        return to_route('tickets.show', $ticket);
    }

    public function index(): Response
    {
        $query = Ticket::query()
            ->when(! Auth::user()->is_it, fn($query) => $query->where('user_id', Auth::id()))
            ->orderByDesc('urgent')
            ->latest();

        return Inertia::render('tickets/index', [
            'tickets' => $query->get(),
            'isIt' => Auth::user()->is_it,
            'userName' => Auth::user()->name,
        ]);
    }

    public function show(Ticket $ticket): Response
    {
        abort_unless(Auth::user()->is_it || $ticket->user_id === Auth::id(), 403);

        $ticket->load('attachments');

        return Inertia::render('tickets/show', [
            'ticket' => $ticket,
            'isIt' => Auth::user()->is_it,
        ]);
    }

    public function destroy(Ticket $ticket): RedirectResponse
    {
        abort_unless($ticket->user_id === Auth::id(), 403);

        Storage::disk('public')->delete($ticket->attachments()->pluck('file_name')->toArray());

        $ticket->delete();

        return to_route('tickets.index');
    }

    public function updateUrgency(Request $request, Ticket $ticket): RedirectResponse
    {
        abort_unless(Auth::user()->is_it || $ticket->user_id === Auth::id(), 403);

        $validated = $request->validate([
            'urgent' => ['required', 'boolean'],
        ]);

        $ticket->update($validated);

        return back();
    }

    public function updateStatus(Request $request, Ticket $ticket): RedirectResponse
    {
        abort_unless(Auth::user()->is_it, 403);

        $validated = $request->validate([
            'status' => ['required', 'string', 'in:pending,accepted,solved,needs_travel'],
            'resolution_notes' => ['nullable', 'string', 'max:5000'],
        ]);

        $ticket->update($validated);

        return back();
    }
}
