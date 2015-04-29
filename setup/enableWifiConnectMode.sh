#!/bin/sh

main() {
  rm /etc/network/interfaces
  ln -s /etc/network/interfaces.broadcast /etc/network/interfaces

  service hostapd stop
  service udhcpd stop

  update-rc.d hostapd disable
  update-rc.d udhcpd disable

  reboot now
}

main
