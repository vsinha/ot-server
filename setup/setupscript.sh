#!/bin/bash

doUpdatesAndInstalls() {
  apt-get update
  apt-get -y upgrade
  apt-get -y install vim git unzip python3 python3-pip hostapd udhcpd avahi-daemon

  pip install autobahn[asyncio]
}

# generate a unique ID to prevent naming 
# collisions with multiple servers
generateRandomNumber () {
  FLOOR=0
  RANGE=99
  NUM=0 # initialize

  while [ "$NUM" -le $FLOOR ]; do
    NUM=$RANDOM
    let "NUM %= RANGE" # scales NUM within range
    NUM=`printf "%02d" $NUM` # zero-pad 
  done
  echo $NUM # return
}

#NAME="opentron" # uncomment this to ignore the fancy renaming
NAME="opentron$(generateRandomNumber)"

setHostname() {
  echo "Using hostname ${NAME}.local"

  # change the hostname to opentronXX
  echo ${NAME} > /etc/hostname

  # reread the hostname file
  /etc/init.d/hostname.sh
}

setupInterfaceConfigFiles() {
  mv /etc/network/interfaces /etc/network/interfaces.bak
  # insert two modes of /etc/network/interfaces:
  # interfaces.broadcast for broadcasting a network
  echo "Inserting /etc/network/interfaces.broadcast"
  cat > /etc/network/interfaces.broadcast << EOF
# loopback adapter
auto lo
iface lo inet loopback

# static ip on wlan0
iface wlan0 inet static
address 10.10.0.1
netmask 255.255.255.0
EOF

  # interfaces.wificonnect for connecting 
  # to an existing wifi network
  echo "Inserting /etc/network/interfaces.wificonnect"
  cat > /etc/network/interfaces.wificonnect << EOF
auto lo
iface lo inet loopback
iface eth0 inet dhcp

allow-hotplug wlan0
iface wlan0 inet manual
wpa-roam /etc/wpa_supplicant/wpa_supplicant.conf
iface default inet dhcp
EOF
}

setupHostAPD() {
  # configure settings for hostapd
  echo "Configuring hostapd" 
  echo "Inserting /etc/hostapd/hostapd.conf"
  cat > /etc/hostapd/hostapd.conf << EOF
interface=wlan0
driver=rtl871xdrv
ssid=${NAME}
channel=6
wmm_enabled=1
wpa=1
wpa_passphrase=ot1
wpa_key_mgmt=WPA-PSK
wpa_pairwise=TKIP
rsn_pairwise=CCMP
auth_algs=1
macaddr_acl=0
EOF

  # config specific to the wifi adapter we're using
  # http://www.daveconroy.com/turn-your-raspberry-pi-into-a-wifi-hotspot-with-edimax-nano-usb-ew-7811un-rtl8188cus-chipset/
  unzip ./hostapd.zip 
  mv /usr/sbin/hostapd /usr/sbin/hostapd.bak
  mv ./hostapd /usr/sbin/hostapd.edimax 
  ln -sf /usr/sbin/hostapd.edimax /usr/sbin/hostapd 
  chown root.root /usr/sbin/hostapd 
  chmod 755 /usr/sbin/hostapd

  # use the config file we've created
  sed -i 's/#DAEMON_CONF\=\"\"/DAEMON_CONF\=\"\/etc\/hostapd\/hostapd.conf\"/g' /etc/default/hostapd
}

setupDHCP() {
  echo "Configuring DHCP (udhcpd)"
  echo "Inserting /etc/udhcpd.conf"
  cat > /etc/udhcpd.conf << EOF
start 10.10.0.2 # This is the range of IPs that the hostspot will give to client devices.
end 10.10.0.255
interface wlan0 # The device uDHCP listens on.
remaining yes
opt dns 8.8.8.8 4.2.2.2 # The DNS servers client devices will use.
opt subnet 255.255.255.0
opt router 10.10.0.2 # The Pi's IP address on wlan0 which we will set up shortly.
opt lease 864000 # 10 day DHCP lease time in seconds 
EOF

 sed -i 's/DHCPD_ENABLED\=\"no\"/#DHCP_ENABLED\=\"no\"/g' /etc/default/udhcpd
}

main() {
  doUpdatesAndInstalls
  setHostname
  setupInterfaceConfigFiles
  setupHostAPD
  setupDHCP

  echo "done!"
}

main

