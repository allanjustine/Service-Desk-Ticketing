import { Head, Link, router } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { useState } from 'react';
import { z } from 'zod';
import { logout } from '@/actions/App/Http/Controllers/AuthController';
import { index, store } from '@/actions/App/Http/Controllers/TicketController';

const ticketSchema = z.object({
    requester_name: z.string().trim().min(1, 'Your name is required.'),
    branch_name: z.string().trim().min(1, 'Branch name is required.'),
    branch_code: z
        .string()
        .uppercase()
        .trim()
        .min(1, 'Branch code is required.'),
    concern: z.string().min(1, 'Select a concern.'),
    concern_description: z
        .string()
        .trim()
        .min(10, 'Please add at least 10 characters.'),
    anydesk_id: z
        .string()
        .regex(/^\d+$/, 'Use numbers only for the AnyDesk ID.'),
});

type TicketForm = z.infer<typeof ticketSchema>;

const initialForm: TicketForm = {
    requester_name: '',
    branch_name: '',
    branch_code: '',
    concern: '',
    concern_description: '',
    anydesk_id: '',
};

export default function CreateTicket({
    user,
}: {
    user: { branch_name: string; branch_code: string; name: string };
}) {
    const [form, setForm] = useState<TicketForm>(() => ({
        ...initialForm,
        branch_name: user.branch_name,
        branch_code: user.branch_code,
        requester_name: user.name,
    }));
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitted, setSubmitted] = useState(false);

    function updateField(field: keyof TicketForm, value: string) {
        setForm((current) => ({ ...current, [field]: value }));
        setErrors((current) => ({ ...current, [field]: '' }));
    }

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const result = ticketSchema.safeParse(form);

        if (!result.success) {
            const nextErrors: Record<string, string> = {};
            result.error.issues.forEach((issue) => {
                const field = issue.path[0];

                if (typeof field === 'string' && !nextErrors[field]) {
                    nextErrors[field] = issue.message;
                }
            });

            setErrors(nextErrors);

            return;
        }

        setSubmitted(true);
        router.post(store.url(), result.data, {
            onError: (serverErrors) => {
                setSubmitted(false);
                setErrors(serverErrors as Record<string, string>);
            },
        });
    }

    return (
        <>
            <Head title="Submit a Ticket" />
            <main className="min-h-screen px-5 py-6 sm:px-8 lg:px-12">
                <nav className="mx-auto flex max-w-6xl items-center justify-between">
                    <Link
                        href={index.url()}
                        className="flex items-center gap-3 text-sm font-bold tracking-wide text-[#10243e]"
                    >
                        <span className="grid size-10 place-items-center rounded-xl bg-[#0b5cad] text-lg text-white shadow-lg shadow-blue-900/15">
                            IT
                        </span>
                        Service desk
                    </Link>
                    <div className="flex items-center gap-4">
                        <Link
                            href={index.url()}
                            className="text-sm font-semibold text-[#0b5cad] hover:text-[#073e78]"
                        >
                            My tickets <span aria-hidden="true">-&gt;</span>
                        </Link>
                        <button
                            type="button"
                            onClick={() => router.post(logout.url())}
                            className="text-sm font-bold text-[#536a84]"
                        >
                            Sign out
                        </button>
                    </div>
                </nav>

                <section className="mx-auto grid max-w-6xl gap-8 py-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-start lg:py-20">
                    <div className="pt-3">
                        <p className="mb-5 inline-flex items-center gap-2 rounded-full bg-[#ffcf46] px-3 py-1 text-xs font-extrabold tracking-[0.18em] text-[#10243e] uppercase">
                            Support request
                        </p>
                        <h1 className="max-w-lg text-5xl leading-[0.98] font-black tracking-[-0.04em] text-[#10243e] sm:text-6xl">
                            Tell us what needs fixing.
                        </h1>
                        <p className="mt-6 max-w-md text-lg leading-8 text-[#536a84]">
                            Give the IT team the details they need to connect
                            quickly and get your branch moving again.
                        </p>
                        <div className="mt-10 flex items-center gap-4 text-sm text-[#536a84]">
                            <span className="grid size-9 place-items-center rounded-full bg-white font-bold text-[#0b5cad] shadow-sm">
                                01
                            </span>
                            <span>
                                Describe the issue and share your AnyDesk ID.
                            </span>
                        </div>
                    </div>

                    <form
                        onSubmit={submit}
                        className="rounded-4xl border border-white/80 bg-white p-6 shadow-[0_24px_70px_rgba(37,83,126,0.14)] sm:p-9"
                    >
                        <div className="mb-8 flex items-start justify-between gap-4">
                            <div>
                                <h2 className="text-2xl font-extrabold text-[#10243e]">
                                    New support ticket
                                </h2>
                                <p className="mt-1 text-sm text-[#71849a]">
                                    All fields are required.
                                </p>
                            </div>
                            <span className="rounded-lg bg-[#e8f2fb] px-3 py-2 text-xs font-bold text-[#0b5cad]">
                                PENDING
                            </span>
                        </div>
                        <div className="grid gap-5 sm:grid-cols-2">
                            <Field
                                label="Your name"
                                name="requester_name"
                                value={form.requester_name}
                                error={errors.requester_name}
                                onChange={(value) =>
                                    updateField('requester_name', value)
                                }
                            />
                            <Field
                                label="Branch name"
                                name="branch_name"
                                value={form.branch_name}
                                error={errors.branch_name}
                                onChange={(value) =>
                                    updateField('branch_name', value)
                                }
                                readOnly
                            />
                            <Field
                                label="Branch code"
                                name="branch_code"
                                value={form.branch_code}
                                error={errors.branch_code}
                                onChange={(value) =>
                                    updateField(
                                        'branch_code',
                                        value.toUpperCase(),
                                    )
                                }
                                readOnly
                            />
                            <div>
                                <label
                                    htmlFor="concern"
                                    className="mb-2 block text-sm font-bold text-[#294662]"
                                >
                                    Concern
                                </label>
                                <select
                                    id="concern"
                                    value={form.concern}
                                    onChange={(event) =>
                                        updateField(
                                            'concern',
                                            event.target.value,
                                        )
                                    }
                                    className="field"
                                >
                                    <option value="">Select concern</option>
                                    <option>Computer / Laptop</option>
                                    <option>Printer</option>
                                    <option>Internet / Network</option>
                                    <option>Email / Account</option>
                                    <option>Others</option>
                                </select>
                                <ErrorMessage error={errors.concern} />
                            </div>
                            <div className="sm:col-span-2">
                                <label
                                    htmlFor="concern_description"
                                    className="mb-2 block text-sm font-bold text-[#294662]"
                                >
                                    Explain the concern
                                </label>
                                <textarea
                                    id="concern_description"
                                    value={form.concern_description}
                                    onChange={(event) =>
                                        updateField(
                                            'concern_description',
                                            event.target.value,
                                        )
                                    }
                                    className="field min-h-32 resize-y"
                                    placeholder="What happened? Include any error message or steps already tried."
                                />
                                <ErrorMessage
                                    error={errors.concern_description}
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <label
                                    htmlFor="anydesk_id"
                                    className="mb-2 block text-sm font-bold text-[#294662]"
                                >
                                    AnyDesk ID
                                </label>
                                <input
                                    id="anydesk_id"
                                    inputMode="numeric"
                                    value={form.anydesk_id}
                                    onChange={(event) =>
                                        updateField(
                                            'anydesk_id',
                                            event.target.value,
                                        )
                                    }
                                    className="field"
                                    placeholder="Example: 123 456 789"
                                />
                                <p className="mt-2 text-xs text-[#71849a]">
                                    Keep AnyDesk open so the IT team can remote
                                    you.
                                </p>
                                <ErrorMessage error={errors.anydesk_id} />
                            </div>
                        </div>
                        <button
                            disabled={submitted}
                            className="mt-8 flex w-full items-center justify-center gap-3 rounded-xl bg-[#0b5cad] px-5 py-4 font-extrabold text-white transition hover:bg-[#073e78] disabled:cursor-wait disabled:opacity-60"
                        >
                            {submitted ? 'Sending ticket...' : 'Submit ticket'}{' '}
                            <span aria-hidden="true">-&gt;</span>
                        </button>
                    </form>
                </section>
            </main>
        </>
    );
}

function Field({
    label,
    name,
    value,
    error,
    onChange,
    readOnly = false,
}: {
    label: string;
    name: string;
    value: string;
    error?: string;
    onChange: (value: string) => void;
    readOnly?: boolean;
}) {
    return (
        <div>
            <label
                htmlFor={name}
                className="mb-2 block text-sm font-bold text-[#294662]"
            >
                {label}
            </label>
            <input
                id={name}
                name={name}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className="field"
                readOnly={readOnly}
            />
            <ErrorMessage error={error} />
        </div>
    );
}

function ErrorMessage({ error }: { error?: string }) {
    return error ? (
        <p className="mt-2 text-xs font-semibold text-red-600">{error}</p>
    ) : null;
}
