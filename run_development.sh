#!/bin/bash

docker-compose up -d postgres
docker-compose up initialize_database

source .env
npm start
