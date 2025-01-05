#!/bin/bash

### Wait for postgres to be ready ###
timeout_limit=30
timeout_counter=0
until pg_isready -h ${PGHOST}
do
    timeout_counter=$((timeout_counter+1))
    echo "Waiting for Postgres: ${timeout_counter}/${timeout_limit}"
    if [ ${timeout_counter} -ge ${timeout_limit} ]
    then
        echo "initialize_database script timed out waiting for postgres"
        exit 1
    fi
    sleep 5s
done
echo "Postgres has started"

### Initialize database ###
script_dir=$(dirname "$0")
if psql -h ${PGHOST} -U postgres -lqt | cut -d \| -f 1 | grep -qw "super_bowl_quiz"
then
    echo "super_bowl_quiz database already exists."
    PGPASSWORD="${SUPER_BOWL_QUIZ_PGPASSWORD}" psql -h ${PGHOST} -U super_bowl_quiz -d super_bowl_quiz -c "BEGIN;COMMIT;" \
        && echo "login successful" \
        || echo "login failed"; exit 1
else
    set -e
    echo "super_bowl_quiz database does not exist. Initializing the database"
    psql -h ${PGHOST} -U postgres -d postgres -f ${script_dir}/create_db.sql
    psql -h ${PGHOST} -U postgres -d super_bowl_quiz -f ${script_dir}/create_user.sql
    psql -h ${PGHOST} -U postgres -d super_bowl_quiz -c "ALTER USER super_bowl_quiz WITH PASSWORD '${SUPER_BOWL_QUIZ_PGPASSWORD}'"
fi
