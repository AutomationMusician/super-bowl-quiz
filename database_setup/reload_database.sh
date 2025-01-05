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
set -e
psql -h ${PGHOST} -U postgres -d postgres -c "DROP DATABASE IF EXISTS super_bowl_quiz; CREATE DATABASE super_bowl_quiz;"
psql -h ${PGHOST} -U postgres -d super_bowl_quiz -f ${script_dir}/dump/super_bowl_quiz.sql