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
    public function create(): Response
    {
        $user = Auth::user();

        return Inertia::render('tickets/create', compact('user'));
    }

    public function store(StoreTicketRequest $request): RedirectResponse
    {
        $ticket = Auth::user()->tickets()->create($request->validated());

        return to_route('tickets.show', $ticket);
    }

    public function index(): Response
    {
        $query = Ticket::query()->latest();

        if (! Auth::user()->is_it) {
            $query->where('user_id', Auth::id());
        }

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
