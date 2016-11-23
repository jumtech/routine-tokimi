#!/bin/bash

cmd='$(npm bin)/sequelize'
docker-compose exec node bash -c "$cmd $@"

