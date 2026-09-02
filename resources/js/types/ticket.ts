export const ticketStatuses = [
    'pending',
    'accepted',
    'solved',
    'needs_travel',
] as const;

export type TicketStatus = (typeof ticketStatuses)[number];

export type TicketAttachment = {
    id: number;
    ticket_id: string;
    original_name: string;
    file_name: string;
    mime_type: string;
    size: number;
    created_at: string;
    updated_at: string;
};

export type Ticket = {
    id: string;
    requester_name: string;
    branch_name: string;
    branch_code: string;
    concern: string;
    concern_description: string;
    anydesk_id: string;
    status: TicketStatus;
    urgent: boolean;
    ticket_code: string;
    resolution_notes: string | null;
    attachments: TicketAttachment[];
    created_at: string;
    updated_at: string;
};
