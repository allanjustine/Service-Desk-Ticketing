import { Link, usePage, router } from '@inertiajs/react';
import { logout } from '@/actions/App/Http/Controllers/AuthController';
import { index as ticketsIndex } from '@/actions/App/Http/Controllers/TicketController';
import { create } from '@/actions/App/Http/Controllers/TicketController';
import { index as usersIndex } from '@/actions/App/Http/Controllers/UserController';
import { index as dashboard } from '@/actions/App/Http/Controllers/DashboardController';

type AuthUser = {
    auth: {
        user: { name: string; is_it: boolean };
    };
};

type PageProps = AuthUser;

export function AppNav({ className = '' }: { className?: string }) {
    const { props, url } = usePage<PageProps>();
    const { name: userName, is_it: isIt } = props.auth.user;

    return (
        <nav
            className={`mx-auto flex max-w-6xl items-center justify-between ${className}`.trim()}
        >
            <Link
                href="/tickets"
                className="flex items-center gap-3 text-sm font-bold tracking-wide text-[#10243e]"
            >
                <span className="grid size-10 place-items-center rounded-xl bg-[#0b5cad] text-lg text-white">
                    IT
                </span>
                Service desk
            </Link>

            <div className="flex items-center gap-4">
                <span className="hidden text-sm text-[#536a84] sm:inline">
                    {userName}
                </span>
                {isIt && (
                    <>
                        <Link
                            href={dashboard.url()}
                            className={`rounded-lg ${url === dashboard.url() ? 'bg-blue-300 text-[#03315e]' : 'text-[#0b5cad]'} p-2 text-sm font-bold`}
                        >
                            Dashboard
                        </Link>
                        <Link
                            href={usersIndex.url()}
                            className={`rounded-lg ${url === usersIndex.url() ? 'bg-blue-300 text-[#03315e]' : 'text-[#0b5cad]'} p-2 text-sm font-bold`}
                        >
                            Users
                        </Link>
                    </>
                )}
                <Link
                    href={ticketsIndex.url()}
                    className={`rounded-lg ${url === ticketsIndex.url() ? 'bg-blue-300 text-[#03315e]' : 'text-[#0b5cad]'} p-2 text-sm font-bold`}
                >
                    Ticket Queue
                </Link>
                {!isIt && (
                    <Link
                        href={create.url()}
                        className="rounded-lg bg-[#ffcf46] px-4 py-2.5 text-sm font-extrabold text-[#10243e]"
                    >
                        + New ticket
                    </Link>
                )}
                <button
                    type="button"
                    onClick={() => {
                        if (
                            window.confirm('Are you sure you want to logout?')
                        ) {
                            router.post(logout.url());
                        }
                    }}
                    className="text-sm font-bold text-[#536a84]"
                >
                    Sign out
                </button>
            </div>
        </nav>
    );
}
