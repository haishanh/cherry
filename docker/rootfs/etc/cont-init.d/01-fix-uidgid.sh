#!/usr/bin/with-contenv sh
# shellcheck shell=sh

if [ -n "${PGID}" ] && [ "${PGID}" != "$(id -g nodejs)" ]; then
  echo "Switching to PGID ${PGID}..."
  sed -i -e "s/^nodejs:\([^:]*\):[0-9]*/nodejs:\1:${PGID}/" /etc/group
  sed -i -e "s/^nodejs:\([^:]*\):\([0-9]*\):[0-9]*/nodejs:\1:\2:${PGID}/" /etc/passwd
fi
if [ -n "${PUID}" ] && [ "${PUID}" != "$(id -u nodejs)" ]; then
  echo "Switching to PUID ${PUID}..."
  sed -i -e "s/^nodejs:\([^:]*\):[0-9]*:\([0-9]*\)/nodejs:\1:${PUID}:\2/" /etc/passwd
fi
