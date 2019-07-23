#!/bin/bash
if [ "$EUID" -ne 0 ]
  then echo "Please run as root"
  exit
fi
cp ./seedbox.service /lib/systemd/system/seedbox.service
systemctl daemon-reload
systemctl enable seedbox.service
systemctl start seedbox.service
echo "Systemd service copied and started!"

