import { Head, Link, usePoll } from '@inertiajs/react';
import { useState } from 'react';
import { show } from '@/actions/App/Http/Controllers/TicketController';
import { AppNav } from '@/components/app-nav';
import { Toast } from '@/components/ui/toast';
import type { Ticket, TicketStatus } from '@/types/ticket';

const statusLabels: Record<TicketStatus, string> = {
    pending: 'Pending',
    accepted: 'Accepted',
    solved: 'Solved',
    needs_travel: 'Needs travel',
};

export default function TicketIndex({
    tickets,
    isIt,
    userName,
}: {
    tickets: Ticket[];
    isIt: boolean;
    userName: string;
}) {
    const [filter, setFilter] = useState<TicketStatus | 'all'>('all');
    const [concernFilter, setConcernFilter] = useState('all');
    const [toastOpen, setToastOpen] = useState(false);

    usePoll(10000, {
        only: ['tickets'],
    });

    const concerns = Array.from(
        new Set(tickets.map((ticket) => ticket.concern)),
    ).sort();
    const visibleTickets = tickets.filter(
        (ticket) =>
            (filter === 'all' || ticket.status === filter) &&
            (concernFilter === 'all' || ticket.concern === concernFilter),
    );
    const counts = tickets.reduce<Record<string, number>>(
        (all, ticket) => ({
            ...all,
            [ticket.status]: (all[ticket.status] ?? 0) + 1,
        }),
        {},
    );

    function copyAnyDesk(id: string) {
        navigator.clipboard.writeText(id).then(() => setToastOpen(true));
    }

    return (
        <>
            <Head
                title={`${tickets.length > 0 ? `(${tickets.length}) ` : ''}Tickets`}
            />
            <main className="min-h-screen px-5 py-6 sm:px-8 lg:px-12">
                <AppNav />
                <section className="mx-auto max-w-6xl py-12">
                    <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
                        <div>
                            <p className="text-sm font-extrabold tracking-[0.18em] text-[#0b5cad] uppercase">
                                {isIt ? 'Operations' : 'My requests'}
                            </p>
                            <h1 className="mt-3 text-5xl font-black tracking-[-0.04em] text-[#10243e]">
                                {isIt ? 'IT ticket queue' : 'My tickets'}
                            </h1>
                            <p className="mt-3 text-[#536a84]">
                                Every request, ready for the next helpful
                                action.
                            </p>
                        </div>
                        <div className="flex gap-2 text-center text-xs font-bold">
                            <Metric
                                label="Open"
                                value={
                                    tickets.filter(
                                        (ticket) => ticket.status !== 'solved',
                                    ).length
                                }
                            />
                            <Metric label="Solved" value={counts.solved ?? 0} />
                        </div>
                    </div>
                    <div className="mt-10 flex gap-2 overflow-x-auto border-b border-[#cbddec] pb-3">
                        {(
                            [
                                'all',
                                'pending',
                                'accepted',
                                'needs_travel',
                                'solved',
                            ] as const
                        ).map((value) => (
                            <button
                                key={value}
                                onClick={() => setFilter(value)}
                                className={`rounded-lg px-3 py-2 text-sm font-bold whitespace-nowrap ${filter === value ? 'bg-[#0b5cad] text-white' : 'text-[#536a84] hover:bg-white'}`}
                            >
                                {value === 'all'
                                    ? 'All tickets'
                                    : statusLabels[value]}{' '}
                                <span className="ml-1 opacity-70">
                                    {value === 'all'
                                        ? tickets.length
                                        : (counts[value] ?? 0)}
                                </span>
                            </button>
                        ))}
                    </div>
                    <div className="mt-5 flex flex-wrap items-center gap-3">
                        <label
                            htmlFor="concern-filter"
                            className="text-sm font-bold text-[#294662]"
                        >
                            Filter by concern
                        </label>
                        <select
                            id="concern-filter"
                            value={concernFilter}
                            onChange={(event) =>
                                setConcernFilter(event.target.value)
                            }
                            className="rounded-lg border border-[#cbddec] bg-white px-3 py-2 text-sm font-bold text-[#294662] outline-none focus:border-[#0b5cad]"
                        >
                            <option value="all">All concerns</option>
                            {concerns.map((concern) => (
                                <option key={concern} value={concern}>
                                    {concern}
                                </option>
                            ))}
                        </select>
                        <span className="text-xs text-[#71849a]">
                            Refreshes every 10 seconds
                        </span>
                    </div>
                    <div className="mt-5 grid gap-4">
                        {visibleTickets.length ? (
                            visibleTickets.map((ticket) => (
                                <article
                                    key={ticket.id}
                                    className={`rounded-2xl border border-white/80 ${ticket.urgent ? 'animate-pulse bg-red-100' : 'bg-white'} p-5 shadow-[0_12px_35px_rgba(37,83,126,0.08)]`}
                                >
                                    <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-3">
                                                <Link
                                                    href={show.url(ticket.id)}
                                                    className="text-lg font-extrabold text-[#10243e] hover:text-[#0b5cad]"
                                                >
                                                    #
                                                    {String(ticket.id).padStart(
                                                        4,
                                                        '0',
                                                    )}{' '}
                                                    · {ticket.concern}
                                                </Link>
                                                <StatusPill
                                                    status={ticket.status}
                                                />
                                                {ticket.urgent && (
                                                    <span className="rounded-full bg-red-300 px-2.5 py-1 text-xs font-extrabold text-red-950">
                                                        Urgent
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-lg font-extrabold text-[#10243e] hover:text-[#0b5cad]">
                                                {ticket.ticket_code}
                                            </p>
                                            <p className="mt-2 text-sm text-[#536a84]">
                                                {ticket.requester_name} ·{' '}
                                                {ticket.branch_name}{' '}
                                                <span className="text-[#8ba0b5]">
                                                    ({ticket.branch_code})
                                                </span>
                                            </p>
                                            <p className="mt-3 max-w-2xl truncate text-sm text-[#71849a]">
                                                {ticket.concern_description}
                                            </p>
                                        </div>
                                        <div className="flex shrink-0 items-center gap-3">
                                            <button
                                                onClick={() =>
                                                    copyAnyDesk(
                                                        ticket.anydesk_id,
                                                    )
                                                }
                                                title="Copy AnyDesk ID"
                                                className="rounded-lg border border-[#cbddec] px-3 py-2 text-sm font-bold text-[#0b5cad] hover:bg-[#e8f2fb]"
                                            >
                                                Copy ID
                                            </button>
                                        </div>
                                    </div>
                                </article>
                            ))
                        ) : (
                            <div className="rounded-2xl border border-dashed border-[#9eb8cf] bg-white/60 p-12 text-center text-[#536a84]">
                                No tickets in this view.
                            </div>
                        )}
                    </div>
                </section>
            </main>
            <Toast
                open={toastOpen}
                onOpenChange={setToastOpen}
                title="AnyDesk ID copied"
                description="The remote session ID is ready to paste."
            />
        </>
    );
}

function Metric({ label, value }: { label: string; value: number }) {
    return (
        <div className="min-w-20 rounded-xl bg-white px-3 py-2">
            <strong className="block text-xl text-[#0b5cad]">{value}</strong>
            <span className="text-[#71849a]">{label}</span>
        </div>
    );
}
function StatusPill({ status }: { status: TicketStatus }) {
    return (
        <span
            className={`rounded-full px-2.5 py-1 text-xs font-extrabold ${status === 'solved' ? 'bg-[#dff5e9] text-[#187347]' : status === 'accepted' ? 'bg-[#e8f2fb] text-[#0b5cad]' : status === 'needs_travel' ? 'bg-[#fff2c7] text-[#8a6500]' : 'bg-[#f0f3f6] text-[#536a84]'}`}
        >
            {statusLabels[status]}
        </span>
    );
}
