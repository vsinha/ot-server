#!/bin/sh

resetNetworkCredentials() {
  cat > /etc/wpa_supplicant/wpa_supplicant.conf << EOF
# /etc/wpa_supplicant/wpa_supplicant.conf
 
ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=netdev
update_config=1
EOF
}


main() {
  service hostapd start
  service udhcpd start

  update-rc.d hostapd enable
  update-rc.d udhcpd enable

  resetNetworkCredentials

  reboot now
}

main
