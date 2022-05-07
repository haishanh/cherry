#!/bin/bash

docker stop s6
docker build . -t s6
docker run -e "DRY_RUN=" \
  --env-file .env \
  -e "GOOGLE_OAUTH_REDIRECT_URI=http://localhost:8000/api/callback/google" \
  -e "DATABASE_PATH=/data/01.db" \
  --rm \
  -v cherry-v1:/data \
  -v /var/run/docker.sock:/var/run/docker.sock \
  --name s6 -d -p 8000:8000 s6

sleep 4
# docker exec s6 yasu nodejs docker run --rm mplatform/mquery crazymax/alpine-s6:latest

docker logs -f s6

# addgroup docker
# addgroup nodejs docker
# yasu nodejs:nodejs docker run --rm mplatform/mquery crazymax/alpine-s6:lates

# yasu root docker run --rm mplatform/mquery crazymax/alpine-s6:latest

# docker run --network -e -v orca01:/data -v /var/run/docker.sock:/var/run/docker.sock --name orca -d -p 8000:8000 r.haishan.me/orca:main
