# Docker + Nginx Deployment

This deployment runs the application with Docker Compose. Nginx is exposed on host port `9110` by default:

- `nginx`: public HTTP server and static asset server
- `app`: PHP-FPM Laravel application
- `worker`: Laravel queue worker
- `database`: MySQL 8.4
- `redis`: cache and queue support

## Server Requirements

- A Linux server with Docker Engine and the Docker Compose plugin
- A DNS `A` record pointing your domain to the server
- TCP port `9110` available for the application, plus ports `80` and `443` if using a host-level HTTPS proxy

## First Deployment

1. Copy the project to the server and check it out at the path used by `DEPLOY_PATH`.
2. Create the production environment file with `cp .env.example .env`.
3. Set `APP_ENV=production`, `APP_DEBUG=false`, your HTTPS `APP_URL`, MySQL credentials, `CACHE_STORE=redis`, `SESSION_DRIVER=redis`, and `QUEUE_CONNECTION=redis` in `.env`. Keep `APP_PORT=9110` unless another host port is required.
4. Generate an application key and put it in `.env`:

    ```sh
    docker run --rm -v "$PWD:/app" -w /app composer:2 php artisan key:generate --show
    ```

5. Build and start the stack:

    ```sh
    docker compose up -d --build
    ```

6. Create the demo IT account only when needed:

    ```sh
    docker compose exec app php artisan db:seed --force
    ```

    The seeded account is `test@example.com` with password `password`. Change or remove this account before exposing the application publicly.

## HTTPS

The included Nginx container listens on host port `9110` and container port `80`. For HTTPS, put a host-level reverse proxy such as Caddy, Traefik, or an existing Nginx in front of `127.0.0.1:9110`, or extend `docker/nginx/default.conf` with your certificate paths. Forward `Host`, `X-Forwarded-For`, and `X-Forwarded-Proto` headers, and keep `APP_URL` set to the HTTPS URL.

## Updates

```sh
git pull
docker compose up -d --build
docker compose exec app php artisan optimize:clear
docker compose exec app php artisan optimize
```

The app entrypoint runs `php artisan migrate --force` on startup. Database and uploaded storage data live in named Docker volumes.

## Backups and Operations

Back up MySQL regularly:

```sh
docker compose exec database sh -c 'exec mysqldump -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE"' > backup.sql
```

Useful commands:

```sh
docker compose ps
docker compose logs -f nginx app worker
docker compose restart worker
docker compose down
```

Never run `docker compose down -v` on production unless you intend to delete all named volumes.

## GitHub Actions Deployment

The `deploy.yml` workflow runs after the CI workflow on pushes to `main`. It connects to the server over SSH, updates the checkout, rebuilds the Compose services, runs Laravel optimization, and checks `http://127.0.0.1:9110/up`.

Create these GitHub repository secrets:

- `DEPLOY_HOST`: server hostname or IP
- `DEPLOY_PORT`: SSH port, usually `22`
- `DEPLOY_USER`: Linux user that can run Docker Compose
- `DEPLOY_SSH_KEY`: private SSH key for that user
- `DEPLOY_PATH`: absolute path to the checked-out project on the server

The server must already have Docker, Docker Compose, the repository checkout, and a production `.env`. The deploy user must be allowed to run Docker. The workflow does not transfer or overwrite `.env`.
