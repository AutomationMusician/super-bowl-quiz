#!/bin/bash

docker-compose up -d postgres
docker-compose up initialize_database

npm start
