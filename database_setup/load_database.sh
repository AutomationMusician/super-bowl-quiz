#!/bin/bash

echo "Hello"
database=superbowlquiz
if psql -h ${PG_HOST} -p ${PG_PORT} -U postgres -lqt | cut -d \| -f 1 | grep -qw "${database}"
then
    echo "${database} database already exists. Skipping initialization process"
else
    echo "${database} database does not exist. Initializating the database"
    psql -h ${PG_HOST} -p ${PG_PORT} -U postgres -d postgres -c "CREATE DATABASE ${database}";
    psql -h ${PG_HOST} -p ${PG_PORT} -U postgres -d ${database} -f configure.sql
fi
