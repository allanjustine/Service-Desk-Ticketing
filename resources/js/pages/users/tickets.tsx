import { Head, Link, router } from '@inertiajs/react';
import { logout } from '@/actions/App/Http/Controllers/AuthController';
import {
    index as ticketsIndex,
    show,
} from '@/actions/App/Http/Controllers/TicketController';
import { index as usersIndex } from '@/actions/App/Http/Controllers/UserController';
import type { Ticket } from '@/types/ticket';

type UserDetails = {
    id: number;
    name: string;
    email: string;
    branch_name: string;
    branch_code: string;
};

export default function UserTickets({
    user,
    tickets,
}: {
    user: UserDetails;
    tickets: Ticket[];
}) {
    return (
        <>
            <Head title={`${user.name}'s Requests`} />
            <main className="min-h-screen px-5 py-6 sm:px-8 lg:px-12">
                <nav className="mx-auto flex max-w-6xl items-center justify-between">
                    <Link
                        href={usersIndex.url()}
                        className="text-sm font-extrabold text-[#0b5cad]"
                    >
                        &lt;- Back to users
                    </Link>
                    <div className="flex items-center gap-4">
                        <Link
                            href={ticketsIndex.url()}
                            className="text-sm font-bold text-[#536a84]"
                        >
                            Ticket queue
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
                <section className="mx-auto max-w-6xl py-12">
                    <p className="text-sm font-extrabold tracking-[0.18em] text-[#0b5cad] uppercase">
                        User requests
                    </p>
                    <h1 className="mt-3 text-5xl font-black tracking-[-0.04em] text-[#10243e]">
                        {user.name}
                    </h1>
                    <p className="mt-3 text-[#536a84]">
                        {user.email} · {user.branch_name} · {user.branch_code}
                    </p>
                    <div className="mt-10 grid gap-4">
                        {tickets.length ? (
                            tickets.map((ticket) => (
                                <Link
                                    key={ticket.id}
                                    href={show.url(ticket.id)}
                                    className={`rounded-2xl border border-white/80 ${ticket.urgent ? 'animate-pulse bg-red-100' : 'bg-white'} p-5 shadow-[0_12px_35px_rgba(37,83,126,0.08)] hover:border-[#9eb8cf]`}
                                >
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                        <span className="text-lg font-extrabold text-[#10243e]">
                                            #
                                            {String(ticket.id).padStart(4, '0')}{' '}
                                            · {ticket.concern}
                                        </span>
                                        <span className="rounded-full bg-[#f0f3f6] px-2.5 py-1 text-xs font-extrabold text-[#536a84]">
                                            {ticket.status.replace('_', ' ')}
                                        </span>
                                        {ticket.urgent && (
                                            <span className="rounded-full bg-red-300 px-2.5 py-1 text-xs font-extrabold text-red-950">
                                                Urgent
                                            </span>
                                        )}
                                    </div>
                                    <p className="mt-3 truncate text-sm text-[#71849a]">
                                        {ticket.concern_description}
                                    </p>
                                </Link>
                            ))
                        ) : (
                            <div className="rounded-2xl border border-dashed border-[#9eb8cf] bg-white/60 p-12 text-center text-[#536a84]">
                                This user has no ticket requests.
                            </div>
                        )}
                    </div>
                </section>
            </main>
        </>
    );
}
