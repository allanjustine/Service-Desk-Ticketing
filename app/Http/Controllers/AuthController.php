<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class AuthController extends Controller
{
    public function showLogin(): Response
    {
        return Inertia::render('auth/login');
    }

    public function login(Request $request): RedirectResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
            'remember' => ['boolean'],
        ]);

        if (! Auth::attempt(['email' => $credentials['email'], 'password' => $credentials['password']], $credentials['remember'] ?? false)) {
            return back()->withErrors(['email' => 'Those credentials do not match our records.'])->onlyInput('email');
        }

        $request->session()->regenerate();

        return to_route('tickets.index');
    }

    public function showRegister(): Response
    {
        return Inertia::render('auth/register');
    }

    public function register(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'branch_name' => ['required', 'string', 'unique:users,branch_name', 'max:255'],
            'branch_code' => ['required', 'string', 'unique:users,branch_code', 'uppercase', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'confirmed', 'max:20', 'min:6'],
        ]);

        $user = User::create($validated);
        Auth::login($user);
        $request->session()->regenerate();

        return to_route('tickets.index');
    }

    public function logout(Request $request): RedirectResponse
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return to_route('login');
    }
}
