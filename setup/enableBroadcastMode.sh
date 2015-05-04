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

  systemctl start hostapd 
  systemctl start udhcpd 

  systemctl enable hostapd
  systemctl enable udhcpd

  resetNetworkCredentials

  ifdown wlan0
  ifup wlan0
  ifdown eth0
  ifup eth0

  #reboot now
}

main
