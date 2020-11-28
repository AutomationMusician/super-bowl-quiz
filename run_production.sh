#!/bin/bash

docker-compose up -d postgres
docker-compose up initialize_database
docker-compose up -d web
