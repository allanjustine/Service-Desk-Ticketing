<?php

namespace App\Http\Controllers;

use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('users/index', [
            'users' => User::query()
                ->where('is_it', false)
                ->withCount('tickets')
                ->orderBy('name')
                ->get(),
        ]);
    }

    public function tickets(User $user): Response
    {
        abort_unless(! $user->is_it, 404);

        return Inertia::render('users/tickets', [
            'user' => $user,
            'tickets' => $user->tickets()
                ->orderByDesc('urgent')
                ->latest()
                ->get(),
        ]);
    }
}
