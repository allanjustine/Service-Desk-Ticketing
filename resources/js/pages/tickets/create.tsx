import { Head, Link, router } from '@inertiajs/react';
import type { ChangeEvent, FormEvent } from 'react';
import { useEffect, useState } from 'react';
import { z } from 'zod';
import { AppNav } from '@/components/app-nav';
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
    urgent: z.boolean(),
});

type TicketForm = z.infer<typeof ticketSchema>;

const initialForm: TicketForm = {
    requester_name: '',
    branch_name: '',
    branch_code: '',
    concern: '',
    concern_description: '',
    anydesk_id: '',
    urgent: false,
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
    const [attachments, setAttachments] = useState<File[]>([]);
    const [attachmentPreviews, setAttachmentPreviews] = useState<
        Array<{ id: string; name: string; url?: string }>
    >([]);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        return () => {
            attachmentPreviews.forEach((preview) => {
                if (preview.url) {
                    URL.revokeObjectURL(preview.url);
                }
            });
        };
    }, [attachmentPreviews]);

    function updateField(field: keyof TicketForm, value: string | boolean) {
        setForm((current) => ({ ...current, [field]: value }));
        setErrors((current) => ({ ...current, [field]: '' }));
    }

    function handleAttachmentChange(event: ChangeEvent<HTMLInputElement>) {
        const nextFiles = Array.from(event.target.files ?? []);
        const previews = nextFiles.map((file) => ({
            id: `${file.name}-${file.lastModified}-${file.size}`,
            name: file.name,
            url: file.type.startsWith('image/')
                ? URL.createObjectURL(file)
                : undefined,
        }));

        setAttachments(nextFiles);
        setAttachmentPreviews(previews);
        setErrors((current) => ({ ...current, attachments: '' }));
        event.target.value = '';
    }

    function removeAttachment(index: number) {
        const nextAttachments = attachments.filter(
            (_, itemIndex) => itemIndex !== index,
        );
        const nextPreviews = attachmentPreviews.filter(
            (_, itemIndex) => itemIndex !== index,
        );

        setAttachments(nextAttachments);
        setAttachmentPreviews(nextPreviews);
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

        const formData = new FormData();
        Object.entries(result.data).forEach(([key, value]) => {
            formData.append(key, String(value));
        });
        attachments.forEach((file) => {
            formData.append('attachments[]', file);
        });

        setSubmitted(true);
        router.post(store.url(), formData, {
            forceFormData: true,
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
                <AppNav />

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
                                onChange={() => {}}
                                readOnly
                            />
                            <Field
                                label="Branch code"
                                name="branch_code"
                                value={form.branch_code}
                                error={errors.branch_code}
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
                                    <option>CCTV</option>
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
                            <div className="sm:col-span-2">
                                <label
                                    htmlFor="attachments"
                                    className="mb-2 block text-sm font-bold text-[#294662]"
                                >
                                    Attachments (optional)
                                </label>
                                <input
                                    id="attachments"
                                    type="file"
                                    multiple
                                    accept="image/*,.pdf"
                                    onChange={handleAttachmentChange}
                                    className="field file:mr-4 file:rounded-md file:border-0 file:bg-[#e8f2fb] file:px-3 file:py-2 file:text-sm file:font-bold file:text-[#0b5cad]"
                                />
                                {attachments.length > 0 ? (
                                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                                        {attachmentPreviews.map(
                                            (preview, index) => (
                                                <div
                                                    key={preview.id}
                                                    className="relative overflow-hidden rounded-2xl border border-[#cbddec] bg-[#f8fbfe]"
                                                >
                                                    {preview.url ? (
                                                        <img
                                                            src={preview.url}
                                                            alt={preview.name}
                                                            className="h-28 w-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex h-28 items-center justify-center bg-[#edf6ff] px-3 text-center text-xs font-bold text-[#294662]">
                                                            {preview.name}
                                                        </div>
                                                    )}
                                                    <div className="flex items-center justify-between gap-2 border-t border-[#dfeaf6] bg-white px-3 py-2">
                                                        <span className="truncate text-xs font-semibold text-[#294662]">
                                                            {preview.name}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                removeAttachment(
                                                                    index,
                                                                )
                                                            }
                                                            className="rounded-md border border-red-200 bg-red-50 px-2 py-1 text-[10px] font-bold text-red-700"
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                ) : null}
                                <ErrorMessage error={errors.attachments} />
                            </div>
                            <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-[#cbddec] bg-[#f8fbfe] px-4 py-4 sm:col-span-2">
                                <span>
                                    <span className="block text-sm font-extrabold text-[#294662]">
                                        Mark as urgent
                                    </span>
                                    <span className="mt-1 block text-xs text-[#71849a]">
                                        Use this when the issue is stopping your
                                        branch from operating.
                                    </span>
                                </span>
                                <input
                                    type="checkbox"
                                    checked={form.urgent}
                                    onChange={(event) =>
                                        updateField(
                                            'urgent',
                                            event.target.checked,
                                        )
                                    }
                                    className="size-5 accent-[#e45b45]"
                                />
                            </label>
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
    onChange?: (value: string) => void;
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
                onChange={(event) => onChange && onChange(event.target.value)}
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
