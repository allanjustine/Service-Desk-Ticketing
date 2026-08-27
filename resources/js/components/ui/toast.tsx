import { useEffect } from 'react';
import { cn } from '@/lib/utils';

type ToastProps = {
    open: boolean;
    title: string;
    description?: string;
    onOpenChange: (open: boolean) => void;
};

export function Toast({ open, title, description, onOpenChange }: ToastProps) {
    useEffect(() => {
        if (!open) {
            return;
        }

        const timeout = window.setTimeout(() => onOpenChange(false), 3000);

        return () => window.clearTimeout(timeout);
    }, [onOpenChange, open]);

    if (!open) {
        return null;
    }

    return (
        <div
            role="status"
            className={cn(
                'fixed right-5 bottom-5 z-50 w-[min(360px,calc(100vw-2.5rem))] rounded-xl border border-[#cbddec] bg-white p-4 shadow-2xl shadow-blue-950/15',
            )}
        >
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm font-bold text-[#10243e]">{title}</p>
                    {description ? (
                        <p className="mt-1 text-sm text-[#536a84]">
                            {description}
                        </p>
                    ) : null}
                </div>
                <button
                    type="button"
                    aria-label="Dismiss notification"
                    onClick={() => onOpenChange(false)}
                    className="text-lg leading-none text-[#71849a] hover:text-[#10243e]"
                >
                    ×
                </button>
            </div>
        </div>
    );
}
