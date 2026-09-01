<?php

namespace App\Http\Controllers;

use App\Models\Ticket;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        abort_unless(auth()->user()?->is_it, 403);

        $statuses = Ticket::query()
            ->select('status', DB::raw('count(*) as total'))
            ->groupBy('status')
            ->pluck('total', 'status')
            ->toArray();

        $stats = [
            'total_tickets' => Ticket::count(),
            'total_users' => User::count(),
            'statuses' => [
                'pending' => (int) ($statuses['pending'] ?? 0),
                'accepted' => (int) ($statuses['accepted'] ?? 0),
                'solved' => (int) ($statuses['solved'] ?? 0),
                'needs_travel' => (int) ($statuses['needs_travel'] ?? 0),
            ],
        ];

        return Inertia::render('admin/dashboard', [
            'stats' => $stats,
        ]);
    }
}
