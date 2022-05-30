#!/usr/bin/with-contenv sh
# shellcheck shell=sh

echo "Fixing perms..."

mkdir -p /data /var/run/nginx /var/log/nodejs

# chgrp docker /var/run/docker.sock
# chmod g+w /var/run/docker.sock
# chgrp -R docker /root/.docker

# /data \

chown -R nodejs. \
  /tpls \
  /var/log/nodejs \
  /var/lib/nginx \
  /var/log/nginx \
  /var/run/nginx
