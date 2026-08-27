export const ticketStatuses = [
    'pending',
    'accepted',
    'solved',
    'needs_travel',
] as const;

export type TicketStatus = (typeof ticketStatuses)[number];

export type Ticket = {
    id: string;
    requester_name: string;
    branch_name: string;
    branch_code: string;
    concern: string;
    concern_description: string;
    anydesk_id: string;
    status: TicketStatus;
    resolution_notes: string | null;
    created_at: string;
    updated_at: string;
};
