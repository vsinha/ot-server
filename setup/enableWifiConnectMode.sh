#!/bin/sh

main() {
  rm /etc/network/interfaces
  ln -s /etc/network/interfaces.broadcast /etc/network/interfaces

  #service hostapd stop
  #service udhcpd stop

  #update-rc.d hostapd disable
  #update-rc.d udhcpd disable

  systemctl hostapd stop
  systemctl udhcpd stop

  systemctl hostapd disable
  systemctl udhcpd stop

  reboot now
}

main
