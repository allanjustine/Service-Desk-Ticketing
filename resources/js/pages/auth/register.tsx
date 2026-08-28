import { Head, Link, router } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { useState } from 'react';
import { z } from 'zod';
import { login, register } from '@/actions/App/Http/Controllers/AuthController';

const registerSchema = z
    .object({
        name: z.string().trim().min(1, 'Name is required.'),
        branch_name: z.string().trim().min(1, 'Branch name is required.'),
        branch_code: z
            .string()
            .uppercase()
            .trim()
            .min(1, 'Branch code is required.'),
        email: z.string().trim().email('Enter a valid email address.'),
        password: z.string().min(6, 'Use at least 6 characters.'),
        password_confirmation: z.string(),
    })
    .refine((data) => data.password === data.password_confirmation, {
        path: ['password_confirmation'],
        message: 'Passwords must match.',
    });

export default function Register({
    errors = {},
}: {
    errors?: Record<string, string>;
}) {
    const [form, setForm] = useState({
        name: '',
        branch_name: '',
        branch_code: '',
        email: '',
        password: '',
        password_confirmation: '',
    });
    const [clientErrors, setClientErrors] = useState<Record<string, string>>(
        {},
    );
    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const result = registerSchema.safeParse(form);

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

        router.post(register.url(), form);
    }

    return (
        <>
            <Head title="Register" />
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
                            Get started
                        </p>
                        <h1 className="mt-3 text-4xl font-black tracking-[-0.04em] text-[#10243e]">
                            Create your account
                        </h1>
                        <p className="mt-3 mb-8 text-[#536a84]">
                            Your tickets stay separated and visible only to you.
                        </p>
                        <form onSubmit={submit} className="grid gap-5">
                            <Input
                                label="Name"
                                value={form.name}
                                error={clientErrors.name ?? errors.name}
                                onChange={(value) =>
                                    setForm({ ...form, name: value })
                                }
                            />
                            <Input
                                label="Branch name"
                                value={form.branch_name}
                                error={
                                    clientErrors.branch_name ??
                                    errors.branch_name
                                }
                                onChange={(value) =>
                                    setForm({ ...form, branch_name: value })
                                }
                            />
                            <Input
                                label="Branch code"
                                value={form.branch_code}
                                error={
                                    clientErrors.branch_code ??
                                    errors.branch_code
                                }
                                onChange={(value) =>
                                    setForm({
                                        ...form,
                                        branch_code: value.toUpperCase(),
                                    })
                                }
                            />
                            <Input
                                label="Email"
                                type="email"
                                value={form.email}
                                error={clientErrors.email ?? errors.email}
                                onChange={(value) =>
                                    setForm({ ...form, email: value })
                                }
                            />
                            <Input
                                label="Password"
                                type="password"
                                value={form.password}
                                error={clientErrors.password ?? errors.password}
                                onChange={(value) =>
                                    setForm({ ...form, password: value })
                                }
                            />
                            <Input
                                label="Confirm password"
                                type="password"
                                value={form.password_confirmation}
                                error={
                                    clientErrors.password_confirmation ??
                                    errors.password_confirmation
                                }
                                onChange={(value) =>
                                    setForm({
                                        ...form,
                                        password_confirmation: value,
                                    })
                                }
                            />
                            <button className="rounded-xl bg-[#0b5cad] px-5 py-3.5 font-bold text-white hover:bg-[#073e78]">
                                Create account{' '}
                                <span aria-hidden="true">-&gt;</span>
                            </button>
                        </form>
                        <p className="mt-7 text-center text-sm text-[#536a84]">
                            Already registered?{' '}
                            <Link
                                href={login.url()}
                                className="font-bold text-[#0b5cad]"
                            >
                                Sign in
                            </Link>
                        </p>
                    </div>
                </section>
            </main>
        </>
    );
}

function Input({
    label,
    type = 'text',
    value,
    error,
    onChange,
}: {
    label: string;
    type?: string;
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
