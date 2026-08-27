#!/bin/sh
set -eu

if [ "${APP_ENV:-local}" = "production" ]; then
    php artisan optimize
fi

if [ "${RUN_MIGRATIONS:-false}" = "true" ]; then
    php artisan migrate --force
fi

exec "$@"
