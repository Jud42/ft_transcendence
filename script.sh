#!/bin/sh



if [ $1 = "migration" ]; then
    rm -rf pong/migrations db.sqlite3 \
    && python3 manage.py makemigrations pong \
    && python3 manage.py migrate --run-syncdb
elif [ $1 = "runlive" ]; then
    python3 manage.py livereload
elif [ $1 = "run" ]; then
    python3 manage.py runserver
else 
    echo "$1 argument: unknow !"
fi