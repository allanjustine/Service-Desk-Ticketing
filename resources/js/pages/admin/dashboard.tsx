import { Head } from '@inertiajs/react';
import { AppNav } from '@/components/app-nav';

type DashboardStats = {
    total_tickets: number;
    total_users: number;
    statuses: {
        pending: number;
        accepted: number;
        solved: number;
        needs_travel: number;
    };
};

export default function DashboardPage({ stats }: { stats: DashboardStats }) {
    const cards = [
        { label: 'Total tickets', value: stats.total_tickets },
        { label: 'Pending', value: stats.statuses.pending },
        { label: 'Accepted', value: stats.statuses.accepted },
        { label: 'Solved', value: stats.statuses.solved },
        { label: 'Needs travel', value: stats.statuses.needs_travel },
        { label: 'Total users', value: stats.total_users },
    ];

    return (
        <>
            <Head title="Admin Dashboard" />
            <main className="min-h-screen px-5 py-6 sm:px-8 lg:px-12">
                <AppNav />

                <section className="mx-auto max-w-6xl py-12">
                    <p className="text-sm font-extrabold tracking-[0.18em] text-[#0b5cad] uppercase">
                        Administration
                    </p>
                    <h1 className="mt-3 text-5xl font-black tracking-[-0.04em] text-[#10243e]">
                        Dashboard
                    </h1>
                    <p className="mt-3 text-[#536a84]">
                        Overview of ticket volume, status flow, and team
                        members.
                    </p>

                    <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {cards.map((card) => (
                            <div
                                key={card.label}
                                className="rounded-2xl border border-white/80 bg-white p-6 shadow-[0_12px_35px_rgba(37,83,126,0.08)]"
                            >
                                <p className="text-sm font-bold tracking-[0.14em] text-[#71849a] uppercase">
                                    {card.label}
                                </p>
                                <p className="mt-4 text-4xl font-black tracking-[-0.04em] text-[#10243e]">
                                    {card.value}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
        </>
    );
}
