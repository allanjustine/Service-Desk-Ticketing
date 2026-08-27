import { Head, Link, router, usePoll } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import {
    create,
    index,
    updateStatus,
} from '@/actions/App/Http/Controllers/TicketController';
import { Toast } from '@/components/ui/toast';
import type { Ticket, TicketStatus } from '@/types/ticket';

const labels: Record<TicketStatus, string> = {
    pending: 'Pending',
    accepted: 'Ticket Accepted',
    solved: 'Solved',
    needs_travel: 'Needs travel',
};

export default function ShowTicket({
    ticket,
    isIt,
}: {
    ticket: Ticket;
    isIt: boolean;
}) {
    const [notes, setNotes] = useState(ticket.resolution_notes ?? '');
    const [toastOpen, setToastOpen] = useState(false);

    usePoll(10000, {
        only: ['ticket'],
    });

    function saveStatus(status: TicketStatus) {
        router.patch(
            updateStatus.url(ticket.id),
            { status, resolution_notes: notes },
            { preserveScroll: true },
        );
    }
    function copyAnyDesk() {
        navigator.clipboard
            .writeText(ticket.anydesk_id)
            .then(() => setToastOpen(true));
    }

    return (
        <>
            <Head title={`Ticket #${ticket.id}`} />
            <main className="min-h-screen px-5 py-6 sm:px-8 lg:px-12">
                <nav className="mx-auto flex max-w-4xl items-center justify-between">
                    <Link
                        href={index.url()}
                        className="text-sm font-extrabold text-[#0b5cad]"
                    >
                        &lt;- Back to queue
                    </Link>
                    {!isIt && (
                        <Link
                            href={create.url()}
                            className="rounded-xl bg-[#ffcf46] px-4 py-2.5 text-sm font-extrabold text-[#10243e]"
                        >
                            + New ticket
                        </Link>
                    )}
                </nav>
                <section className="mx-auto max-w-4xl py-12">
                    <div className="rounded-4xl bg-[#0b5cad] p-7 text-white shadow-[0_22px_60px_rgba(11,92,173,0.25)] sm:p-10">
                        <div className="flex flex-wrap items-start justify-between gap-5">
                            <div>
                                <p className="text-sm font-bold tracking-[0.18em] text-[#b9ddff] uppercase">
                                    Ticket #{String(ticket.id).padStart(4, '0')}
                                </p>
                                <h1 className="mt-3 text-4xl font-black tracking-[-0.04em]">
                                    {labels[ticket.status]}
                                </h1>
                                <p className="mt-3 max-w-xl text-[#d8ebfb]">
                                    {ticket.status === 'accepted'
                                        ? 'Please wait for the IT team to remote you. Thank you for your patience.'
                                        : 'Your support request is being looked after by the service desk.'}
                                </p>
                            </div>
                            <span className="rounded-lg bg-[#ffcf46] px-3 py-2 text-xs font-black text-[#10243e] uppercase">
                                {ticket.status.replace('_', ' ')}
                            </span>
                        </div>
                    </div>
                    <div className="mt-5 grid gap-5 md:grid-cols-2">
                        <Info label="Requester" value={ticket.requester_name} />
                        <Info
                            label="Branch"
                            value={`${ticket.branch_name} · ${ticket.branch_code}`}
                        />
                        <Info label="Concern" value={ticket.concern} />
                        <div className="rounded-2xl bg-white p-5 shadow-[0_12px_35px_rgba(37,83,126,0.08)]">
                            <p className="text-xs font-extrabold tracking-wider text-[#71849a] uppercase">
                                AnyDesk ID
                            </p>
                            <div className="mt-2 flex items-center justify-between gap-3">
                                <strong className="text-2xl tracking-wider text-[#10243e]">
                                    {ticket.anydesk_id}
                                </strong>
                                <button
                                    onClick={copyAnyDesk}
                                    className="rounded-lg bg-[#e8f2fb] px-3 py-2 text-sm font-bold text-[#0b5cad]"
                                >
                                    Copy
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="mt-5 rounded-2xl bg-white p-6 shadow-[0_12px_35px_rgba(37,83,126,0.08)]">
                        <p className="text-xs font-extrabold tracking-wider text-[#71849a] uppercase">
                            Concern details
                        </p>
                        <p className="mt-3 leading-7 text-[#294662]">
                            {ticket.concern_description}
                        </p>
                    </div>
                    {ticket.resolution_notes ? (
                        <div className="mt-5 rounded-2xl border border-[#ffcf46] bg-[#fffaf0] p-6">
                            <p className="text-xs font-extrabold tracking-wider text-[#8a6500] uppercase">
                                IT update
                            </p>
                            <p className="mt-3 leading-7 text-[#294662]">
                                {ticket.resolution_notes}
                            </p>
                        </div>
                    ) : null}
                    {isIt ? (
                        <div className="mt-5 rounded-2xl border border-[#cbddec] bg-white p-6">
                            <label
                                htmlFor="resolution_notes"
                                className="text-xs font-extrabold tracking-wider text-[#71849a] uppercase"
                            >
                                IT resolution notes
                            </label>
                            <textarea
                                id="resolution_notes"
                                value={notes}
                                onChange={(event) =>
                                    setNotes(event.target.value)
                                }
                                className="field mt-3 min-h-28 resize-y"
                                placeholder="Explain what was done or why travel is needed."
                            />
                            <div className="mt-4 flex flex-wrap gap-2">
                                <button
                                    onClick={() => saveStatus('pending')}
                                    className="action-button"
                                >
                                    Pending
                                </button>
                                <button
                                    onClick={() => saveStatus('accepted')}
                                    className="action-button"
                                >
                                    Accept ticket
                                </button>
                                <button
                                    onClick={() => saveStatus('needs_travel')}
                                    className="action-button bg-[#fff2c7] text-[#8a6500]"
                                >
                                    Needs travel
                                </button>
                                <button
                                    onClick={() => saveStatus('solved')}
                                    className="action-button bg-[#187347] text-white"
                                >
                                    Mark solved
                                </button>
                            </div>
                        </div>
                    ) : null}
                    <Toast
                        open={toastOpen}
                        onOpenChange={setToastOpen}
                        title="AnyDesk ID copied"
                        description="The remote session ID is ready to paste."
                    />
                </section>
            </main>
        </>
    );
}

function Info({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-2xl bg-white p-5 shadow-[0_12px_35px_rgba(37,83,126,0.08)]">
            <p className="text-xs font-extrabold tracking-wider text-[#71849a] uppercase">
                {label}
            </p>
            <p className="mt-2 font-bold text-[#10243e]">{value}</p>
        </div>
    );
}
