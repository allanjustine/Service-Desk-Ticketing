FROM composer:2 AS vendor

WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-interaction --prefer-dist --optimize-autoloader --no-scripts

FROM php:8.4-fpm-alpine AS php-base

RUN apk add --no-cache icu-libs oniguruma libzip libpng libjpeg-turbo freetype \
    && apk add --no-cache --virtual .build-deps $PHPIZE_DEPS icu-dev oniguruma-dev libzip-dev libpng-dev libjpeg-turbo-dev freetype-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) bcmath exif gd intl mbstring opcache pdo_mysql zip \
    && apk del .build-deps

FROM php-base AS frontend

RUN apk add --no-cache nodejs npm

WORKDIR /var/www/html

COPY package.json package-lock.json ./
RUN npm ci
COPY . .
COPY --from=vendor /app/vendor ./vendor
RUN npm run build

FROM php-base AS app

WORKDIR /var/www/html

COPY --from=vendor /app/vendor ./vendor
COPY --from=frontend /var/www/html/public/build ./public/build
COPY . .

RUN mkdir -p storage/framework/cache storage/framework/sessions storage/framework/views bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache public/build

COPY docker/php/entrypoint.sh /usr/local/bin/entrypoint
RUN chmod +x /usr/local/bin/entrypoint

EXPOSE 9000
ENTRYPOINT ["entrypoint"]
CMD ["php-fpm"]

FROM app AS worker
CMD ["php", "artisan", "queue:work", "--sleep=3", "--tries=3", "--timeout=90"]
