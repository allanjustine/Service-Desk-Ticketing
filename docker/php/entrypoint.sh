#!/bin/sh
set -eu

if [ -d /opt/public-build ]; then
    rm -rf public/build
    mkdir -p public/build
    cp -a /opt/public-build/. public/build/
fi

if [ -d /opt/public-assets ]; then
    cp -f /opt/public-assets/favicon.ico /opt/public-assets/favicon.svg /opt/public-assets/apple-touch-icon.png public/
fi

if [ "${APP_ENV:-local}" = "production" ]; then
    php artisan optimize
fi

if [ "${RUN_MIGRATIONS:-false}" = "true" ]; then
    php artisan migrate --force
fi

exec "$@"
