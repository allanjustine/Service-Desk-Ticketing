# IT Ticketing

## Product Workflow

1. A user registers or signs in before opening the support request form. Guests are redirected to login.
2. A user provides their name, branch name, branch code, concern, concern explanation, and AnyDesk ID.
3. The form validates input with Zod in the browser. The server validates the same contract with `StoreTicketRequest` before creating a ticket.
4. New tickets belong to the signed-in user, start as `Pending`, and are visible only to that user and IT.
5. IT can copy the AnyDesk ID, open the ticket, add resolution notes, and choose one of four statuses:
    - `Pending`: the request has not been picked up yet.
    - `Accepted`: IT is ready to remote the user. The user sees: "Ticket Accepted. Please wait for the IT team to remote you. Thank you for your patience."
    - `Needs travel`: the issue needs an on-site visit.
    - `Solved`: IT has completed the work and can record what was done.
6. The ticket detail page acts as the shared status view for the requester and IT team. Requesters can read IT updates but cannot change statuses.

## Access Rules

- Regular users can create tickets and view only tickets they submitted.
- IT users are marked with `users.is_it = true` and can view every ticket and update its status.
- Status updates are protected by the `it` middleware and return `403 Forbidden` for regular users.
- Set `is_it` only through a trusted seeder or administrative process.

## Field Contract

| Field               | Required        | Rules                                                                      |
| ------------------- | --------------- | -------------------------------------------------------------------------- |
| Requester name      | Yes             | Text, maximum 255 characters                                               |
| Branch name         | Yes             | Text, maximum 255 characters                                               |
| Branch code         | Yes             | Text, maximum 30 characters                                                |
| Concern             | Yes             | Computer / Laptop, Printer, Internet / Network, Email / Account, or Others |
| Concern explanation | Yes             | Text between 10 and 5,000 characters                                       |
| AnyDesk ID          | Yes             | Numeric text, maximum 30 characters                                        |
| Resolution notes    | When IT updates | Optional text, maximum 5,000 characters                                    |

## UI Rules

The interface uses a clear service-desk visual language:

- **Blue** is the action and trust color: navigation, primary buttons, active filters, and IT status signals.
- **White** is the working surface: forms, ticket rows, detail panels, and readable content areas.
- **Yellow** is the attention color: new-ticket actions, small workflow labels, and travel-related emphasis.
- Use dark navy text for readable contrast and soft blue-gray page backgrounds to separate the working surface from the canvas.
- Keep actions obvious and compact. Use an icon or short label for copy actions and always provide a tooltip or accessible label where needed.
- Keep cards lightly rounded, with restrained shadows and generous spacing so ticket information remains easy to scan.

## Routes

| Method | Route                      | Purpose                            |
| ------ | -------------------------- | ---------------------------------- |
| GET    | `/tickets/create`          | User submission form               |
| POST   | `/tickets`                 | Create a pending ticket            |
| GET    | `/tickets`                 | IT queue                           |
| GET    | `/tickets/{ticket}`        | Ticket status and details          |
| PATCH  | `/tickets/{ticket}/status` | Update status and resolution notes |
| GET    | `/login`                   | Sign-in screen                     |
| POST   | `/login`                   | Authenticate a user                |
| GET    | `/register`                | Account registration screen        |
| POST   | `/register`                | Create a regular user account      |
| POST   | `/logout`                  | End the current session            |

## Next Production Steps

- Add authentication and role-based authorization before exposing the IT queue publicly.
- Add requester accounts or a secure ticket lookup token so users only see their own tickets.
- Add notifications for accepted, needs-travel, and solved transitions.
- Add an audit trail for status and resolution-note changes.
