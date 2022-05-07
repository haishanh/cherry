#!/usr/bin/with-contenv sh
# shellcheck shell=sh
# https://github.com/crazy-max/docker-nextcloud/blob/master/rootfs/etc/cont-init.d/04-svc-main.sh

mkdir -p /etc/services.d/nginx
cat > /etc/services.d/nginx/run <<EOL
#!/usr/bin/execlineb -P
with-contenv
s6-setuidgid ${PUID}:${PGID}
nginx -g "daemon off;"
EOL
chmod +x /etc/services.d/nginx/run


# the app currently is running use root
# havn't find a good way to use /var/run/docker.sock with user nodejs

mkdir -p /etc/services.d/app
cat > /etc/services.d/app/run <<EOL
#!/usr/bin/execlineb -P
with-contenv
s6-setuidgid ${PUID}:${PGID}
importas -ui CWD CWD
cd $CWD
node ./build/index.js
EOL
chmod +x /etc/services.d/app/run

# s6-setuidgid ${PUID}:${DOCKER_PGID}
# s6-setuidgid ${PUID}:${PGID}
