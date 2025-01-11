#!/bin/bash

docker compose up

docker stop 2048
docker rm 2048
docker rmi 2048

docker compose up

cp -r ./dist /dist/2048