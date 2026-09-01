import { Head, Link, usePoll } from '@inertiajs/react';
import { AppNav } from '@/components/app-nav';
import { tickets as userTickets } from '@/actions/App/Http/Controllers/UserController';

type UserSummary = {
    id: number;
    name: string;
    email: string;
    branch_name: string;
    branch_code: string;
    tickets_count: number;
};

export default function UsersIndex({ users }: { users: UserSummary[] }) {
    usePoll(10000, {
        only: ['users'],
    });

    return (
        <>
            <Head title="Users" />
            <main className="min-h-screen px-5 py-6 sm:px-8 lg:px-12">
                <AppNav />
                <section className="mx-auto max-w-6xl py-12">
                    <p className="text-sm font-extrabold tracking-[0.18em] text-[#0b5cad] uppercase">
                        Directory
                    </p>
                    <h1 className="mt-3 text-5xl font-black tracking-[-0.04em] text-[#10243e]">
                        Users
                    </h1>
                    <p className="mt-3 text-[#536a84]">
                        Branch contacts and their support request history.
                    </p>
                    <div className="mt-10 grid gap-4 md:grid-cols-2">
                        {users.length ? (
                            users.map((user) => (
                                <article
                                    key={user.id}
                                    className="rounded-2xl border border-white/80 bg-white p-6 shadow-[0_12px_35px_rgba(37,83,126,0.08)]"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <h2 className="text-xl font-extrabold text-[#10243e]">
                                                {user.name}
                                            </h2>
                                            <p className="mt-1 text-sm text-[#536a84]">
                                                {user.email}
                                            </p>
                                        </div>
                                        <span className="rounded-lg bg-[#e8f2fb] px-3 py-2 text-xs font-black text-[#0b5cad]">
                                            {user.tickets_count} requests
                                        </span>
                                    </div>
                                    <p className="mt-5 text-sm font-bold text-[#294662]">
                                        {user.branch_name} · {user.branch_code}
                                    </p>
                                    <Link
                                        href={userTickets.url(user.id)}
                                        className="mt-6 inline-flex rounded-xl bg-[#0b5cad] px-4 py-3 text-sm font-extrabold text-white hover:bg-[#073e78]"
                                    >
                                        View all requests -&gt;
                                    </Link>
                                </article>
                            ))
                        ) : (
                            <div className="rounded-2xl border border-dashed border-[#9eb8cf] bg-white/60 p-12 text-center text-[#536a84] md:col-span-2">
                                No users found.
                            </div>
                        )}
                    </div>
                </section>
            </main>
        </>
    );
}
