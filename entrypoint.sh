#!/bin/sh

set -e

echo "Waiting for postgres..."

# while ! nc -z $DB_HOST $DB_PORT; do
#     sleep 0.1
# done

echo "PostgreSQL started"
command="daphne ftt.asgi:application --bind 0.0.0.0 --port 8000"

# En mode développement, ne pas collecter les fichiers statiques
if [ "$DJANGO_DEBUG" != "true" ]; then
    echo "Production mode: collecting static files..."
    rm -rf /ftt/static/*
    python3 manage.py collectstatic --noinput --clear
    command="python3 manage.py runserver 0.0.0.0:8000"
fi

# Migrations
python3 manage.py makemigrations pong && \
python3 manage.py migrate --run-syncdb

# Démarrer livereload en arrière-plan avec surveillance des fichiers statiques
python3 manage.py livereload --host 0.0.0.0 --port 35729 /ftt/pong/static/ /ftt/pong/templates/ &

# Attendre un peu que livereload démarre
sleep 2

# Démarrer daphne
exec $command
