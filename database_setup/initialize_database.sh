#!/bin/bash

### Wait for postgres to be ready ###
timeout_limit=15
timeout_counter=0
until pg_isready -h ${PGHOST} -p ${PGPORT}
do
    timeout_counter=$((timeout_counter+1))
    echo "Waiting for Postgres: ${timeout_counter}/${timeout_limit}"
    if [ ${timeout_counter} -ge ${timeout_limit} ]
    then
        echo "Waiting for postgres timed out"
        exit 1
    fi
    sleep 5s
done
echo "Postgres has started"

### Initialize database ###
script_dir=$(dirname "$0")
if psql -h ${PGHOST} -p ${PGPORT} -U postgres -lqt | cut -d \| -f 1 | grep -qw "${PGDATABASE}"
then
    echo "${PGDATABASE} database already exists. Skipping initialization process"
else
    set -e
    echo "${PGDATABASE} database does not exist. Initializating the database"
    psql -h ${PGHOST} -p ${PGPORT} -U postgres -d postgres -c "CREATE DATABASE ${PGDATABASE}";
    psql -h ${PGHOST} -p ${PGPORT} -U postgres -d ${PGDATABASE} -f ${script_dir}/initialize.sql
fi
