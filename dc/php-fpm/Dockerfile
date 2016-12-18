FROM php:7.0.8-fpm

MAINTAINER pilot114@bk.ru

RUN apt-get update && apt-get install -y git libssl-dev

RUN docker-php-ext-install zip \
&& docker-php-ext-enable zip

RUN pecl install -o -f redis \
&&  rm -rf /tmp/pear \
&& docker-php-ext-enable redis

RUN pecl install mongodb-alpha \
&&  rm -rf /tmp/pear \
&& docker-php-ext-enable mongodb

# install composer
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# install nano and cron
RUN apt-get install -y nano cron
RUN export TERM=xterm && export EDITOR="/usr/bin/nano"

WORKDIR /usr/share/nginx

COPY php.ini /usr/local/etc/php/php.ini
