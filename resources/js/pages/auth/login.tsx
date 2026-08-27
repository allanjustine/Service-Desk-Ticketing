import { Head, Link, router } from '@inertiajs/react';
import type { FormEvent } from 'react';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { z } from 'zod';
import {
    login,
    showRegister,
} from '@/actions/App/Http/Controllers/AuthController';

const loginSchema = z.object({
    email: z.string().trim().email('Enter a valid email address.'),
    password: z.string().min(1, 'Password is required.'),
});

export default function Login({
    errors = {},
}: {
    errors?: Record<string, string>;
}) {
    const [form, setForm] = useState({
        email: '',
        password: '',
        remember: false,
    });
    const [clientErrors, setClientErrors] = useState<Record<string, string>>(
        {},
    );

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const result = loginSchema.safeParse(form);

        if (!result.success) {
            setClientErrors(
                Object.fromEntries(
                    result.error.issues.map((issue) => [
                        String(issue.path[0]),
                        issue.message,
                    ]),
                ),
            );

            return;
        }

        router.post(login.url(), form);
    }

    return (
        <AuthLayout
            title="Login"
            subtitle="Sign in to submit and track your support tickets."
        >
            <form onSubmit={submit} className="grid gap-5">
                <AuthInput
                    label="Email"
                    type="email"
                    value={form.email}
                    error={clientErrors.email ?? errors.email}
                    onChange={(value) => setForm({ ...form, email: value })}
                />
                <AuthInput
                    label="Password"
                    type="password"
                    value={form.password}
                    error={clientErrors.password}
                    onChange={(value) => setForm({ ...form, password: value })}
                />
                <label className="flex items-center gap-2 text-sm text-[#536a84]">
                    <input
                        type="checkbox"
                        checked={form.remember}
                        onChange={(event) =>
                            setForm({ ...form, remember: event.target.checked })
                        }
                        className="size-4 accent-[#0b5cad]"
                    />
                    Remember me
                </label>
                <button className="rounded-xl bg-[#0b5cad] px-5 py-3.5 font-bold text-white hover:bg-[#073e78]">
                    Sign in <span aria-hidden="true">-&gt;</span>
                </button>
            </form>
            <p className="mt-7 text-center text-sm text-[#536a84]">
                New here?{' '}
                <Link
                    href={showRegister.url()}
                    className="font-bold text-[#0b5cad]"
                >
                    Create an account
                </Link>
            </p>
        </AuthLayout>
    );
}

function AuthLayout({
    title,
    subtitle,
    children,
}: {
    title: string;
    subtitle: string;
    children: ReactNode;
}) {
    return (
        <>
            <Head title={title} />
            <main className="grid min-h-screen place-items-center px-5 py-10">
                <section className="w-full max-w-md">
                    <Link
                        href="/"
                        className="mx-auto mb-10 flex w-fit items-center gap-3 text-sm font-bold text-[#10243e]"
                    >
                        <span className="grid size-10 place-items-center rounded-xl bg-[#0b5cad] text-lg text-white">
                            IT
                        </span>
                        Service desk
                    </Link>
                    <div className="rounded-4xl border border-white/80 bg-white p-7 shadow-[0_24px_70px_rgba(37,83,126,0.14)] sm:p-9">
                        <p className="text-sm font-extrabold tracking-[0.18em] text-[#0b5cad] uppercase">
                            Secure access
                        </p>
                        <h1 className="mt-3 text-4xl font-black tracking-[-0.04em] text-[#10243e]">
                            {title}
                        </h1>
                        <p className="mt-3 mb-8 text-[#536a84]">{subtitle}</p>
                        {children}
                    </div>
                </section>
            </main>
        </>
    );
}
function AuthInput({
    label,
    type,
    value,
    error,
    onChange,
}: {
    label: string;
    type: string;
    value: string;
    error?: string;
    onChange: (value: string) => void;
}) {
    return (
        <label className="grid gap-2 text-sm font-bold text-[#294662]">
            {label}
            <input
                type={type}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className="field"
            />
            {error ? (
                <span className="text-xs text-red-600">{error}</span>
            ) : null}
        </label>
    );
}
