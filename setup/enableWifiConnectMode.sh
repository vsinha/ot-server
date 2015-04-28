#!/bin/sh

main() {
  service hostapd stop
  service udhcpd stop

  update-rc.d hostapd disable
  update-rc.d udhcpd disable

  reboot now
}

main
