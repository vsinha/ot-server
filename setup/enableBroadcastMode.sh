#!/bin/sh

resetNetworkCredentials() {
  cat > /etc/wpa_supplicant/wpa_supplicant.conf << EOF
# /etc/wpa_supplicant/wpa_supplicant.conf
 
ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=netdev
update_config=1
EOF
}


main() {
  rm /etc/network/interfaces
  ln -s /etc/network/interfaces.broadcast /etc/network/interfaces

  #service hostapd start
  #service udhcpd start

  #update-rc.d hostapd enable
  #update-rc.d udhcpd enable

  systemctl hostapd stop
  systemctl udhcpd stop

  systemctl hostapd disable
  systemctl udhcpd disable

  resetNetworkCredentials

  reboot now
}

main
