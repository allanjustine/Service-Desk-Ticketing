# Service Desk Ticketing

An IT service desk application for submitting, tracking, and resolving branch support tickets. Users authenticate before creating tickets, while IT staff can manage the complete ticket queue.

## Features

- User registration, login, and logout
- Per-user ticket ownership and visibility
- IT-only queue access and status management
- Concern filtering for ticket lists
- Ticket polling every 10 seconds
- AnyDesk ID copy action with toast confirmation
- Statuses: Pending, Accepted, Needs travel, and Solved
- IT resolution notes shown on the ticket detail page
- Zod client-side validation and Laravel server-side validation
- Docker Compose deployment with Nginx, PHP-FPM, MySQL, Redis, and a queue worker
- GitHub Actions CI checks and SSH-based production deployment

## Stack

- Laravel 13
- Inertia.js 3
- React 19 and TypeScript
- Tailwind CSS 4
- Vite 8
- MySQL 8.4
- Redis 7
- PHP 8.4
- Node.js 22

## Local Development

### Requirements

- PHP 8.4+
- Composer 2+
- Node.js 22+
- npm or pnpm
- SQLite for the default local database, or MySQL

### Installation

```sh
composer install
copy .env.example .env
php artisan key:generate
php artisan migrate --seed
npm install
npm run dev
```

In another terminal, start Laravel:

```sh
php artisan serve
```

The local application is available at `http://localhost:8000`.

The seed command creates a development IT account:

```text
Email: test@example.com
Password: password
```

Change or remove this account before using a shared or production environment.

## Ticket Workflow

1. A user registers or signs in.
2. The user submits their name, branch name, branch code, concern, explanation, and AnyDesk ID.
3. A ticket starts with `Pending` status and is visible to its owner and IT.
4. IT can copy the AnyDesk ID, accept the ticket, request travel, or mark it solved.
5. IT can add resolution notes, which the ticket owner can read.

Regular users can only view their own tickets. Users marked with `is_it = true` can view all tickets and update statuses.

## Validation

The ticket form validates in both places:

- Browser: Zod schema in `resources/js/pages/tickets/create.tsx`
- Server: `app/Http/Requests/StoreTicketRequest.php`

The server remains the source of truth for security and data integrity.

## Docker Deployment

The Docker stack publishes Nginx on host port `9110` by default:

```sh
cp .env.example .env
docker compose up -d --build
docker compose exec app php artisan db:seed --force
```

Set production values in `.env` before starting the stack:

```dotenv
APP_ENV=production
APP_DEBUG=false
APP_URL=https://tickets.example.com
APP_PORT=9110
DB_CONNECTION=mysql
DB_HOST=database
DB_DATABASE=it_ticketing
DB_USERNAME=it_ticketing
DB_PASSWORD=use-a-long-random-password
DB_ROOT_PASSWORD=use-a-different-long-random-password
CACHE_STORE=redis
SESSION_DRIVER=redis
QUEUE_CONNECTION=redis
```

The stack contains:

- `nginx`: public web server on port `9110`
- `app`: Laravel PHP-FPM application
- `worker`: queue worker
- `database`: MySQL
- `redis`: cache and queue backend

Named volumes preserve MySQL data, application storage, Redis data, and built public assets across rebuilds. Do not use `docker compose down -v` in production unless deleting those volumes is intentional.

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for HTTPS, backups, updates, and server preparation.

## Testing and Checks

Run the focused feature tests:

```sh
php artisan test --compact tests/Feature/AuthTest.php tests/Feature/TicketTest.php
```

Run frontend checks:

```sh
npx tsc --noEmit
npm run lint:check
npm run format:check
npm run build
```

Run the complete project checks:

```sh
composer ci:check
```

## CI/CD

The workflows are in `.github/workflows`:

- `tests.yml` runs CI checks on pull requests and pushes to `main`.
- `deploy.yml` deploys after the `tests` workflow succeeds on `main`, or manually through GitHub Actions.

Configure these repository or production-environment secrets for deployment:

- `DEPLOY_HOST`: production server hostname or IP
- `DEPLOY_PORT`: SSH port, usually `22`
- `DEPLOY_USER`: Linux deployment user
- `DEPLOY_SSH_KEY`: private SSH key for that user
- `DEPLOY_PATH`: absolute path to the application checkout

The server must already have Docker, Docker Compose, the repository checkout, and a production `.env`. The workflow pulls `main`, rebuilds the Compose stack, runs Laravel optimization, and checks `http://127.0.0.1:9110/up`.

## Documentation

- [IT ticketing workflow and field contract](docs/IT-TICKETING.md)
- [Docker, Nginx, and CI/CD deployment guide](docs/DEPLOYMENT.md)
