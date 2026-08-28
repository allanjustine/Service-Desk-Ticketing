<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTicketRequest;
use App\Models\Ticket;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
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
        $ticket = Auth::user()->tickets()->create($request->validated());

        return to_route('tickets.show', $ticket);
    }

    public function index(): Response
    {
        $query = Ticket::query()
            ->when(! Auth::user()->is_it, fn ($query) => $query->where('user_id', Auth::id()))
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

        return Inertia::render('tickets/show', [
            'ticket' => $ticket,
            'isIt' => Auth::user()->is_it,
        ]);
    }

    public function destroy(Ticket $ticket): RedirectResponse
    {
        abort_unless($ticket->user_id === Auth::id(), 403);

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
