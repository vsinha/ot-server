#!/bin/sh

main() {
  rm /etc/network/interfaces
  ln -s /etc/network/interfaces.wificonnect /etc/network/interfaces

  systemctl stop hostapd 
  systemctl stop udhcpd

  systemctl disable hostapd
  systemctl disable udhcpd 

  ifdown wlan0
  ifup wlan0

  #reboot now
}

main
