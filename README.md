# Opentrons Raspberry Pi Connectivity and WAMP Communication Specification

## Overview
On the OT1 platform, a Raspberry Pi (Model 2b) serves the user interface and mediates communication between the UI and the Smoothieboard motor controller. We aim for as-simple-as-possible connectivity, requiring minimal wires and configuration. We want the user to be able to easily use the OT1 both at home as well as in industry/academic environments where WiFi credentials and network access may not always be readily available. As such, the connectivity solution is as follows:

* Out of the box, the Pi will act as a hotspot and broadcast a network, allowing the user to connect directly to it over WiFi. The full UI will be served on the domain `opentron.local:8080` whenever the user is connected directly to the Pi in this manner. We call this "Broadcast" mode.

* The user will be able to connect an ethernet cable from their laptop to the Pi, and enable Internet Sharing over ethernet to grant the Pi network access by piggybacking on the user's laptop computer's internet connection.

* The user will be able to provide the Pi with network credentials and switch the Pi into "Wifi Connect" mode.

* We have opted for WAMP (Web Application Messaging Protocol) based communication, which affords a clean standard for multi-client message forwarding under two main metaphors: Publish & Subscribe (pub/sub) and Remote Procedure Call (RPC). More information on these and how to use them is available in the Crossbar, Autobahn, and WAMP documentation.

* Autobahn is the client library, python and javascript implementations will allow both the pi and browser clients to connect and relay WAMP messages.

* Crossbar will be the router/server.

## Setup
1. On a new SD card, write the Debian Jessie Image. 
2. Connect the Pi via ethernet to your laptop computer, enable Internet Sharing (guide below) 
3. Load this into the Pi, connected to a keyboard and monitor
4. `git clone https://github.com/Opentrons/RPi`, enter credentials when prompted
5. Execute the following to setup the Pi
```
cd RPi/setup
./setup.sh  # enter credentials when prompted
```
This script will do two things. First, it will request root priveleges and execute `setupSystem.sh`, which will use an internet connection to update the Pi, install required packages, setup the hostname, and configure the required shell scripts for hostapd, udhcpd, and two symlinked network/interface files (one for broadcast and one for wifi connect). The script will also execute (without root priveleges) `setupPythonEnvironments.sh`, which will configure two python virtual environments, one for python2 (ot2) and one for python3 (ot3) with all the required python dependencies (installed using pip) for running Crossbar and Autobahn in python 2 and 3, respectively. **It is important to use these virtualenvs when working on the codebase**. We may see weird python2/3 conflicts otherwise.

### Quick primer on Python virtualenvs:
`source /usr/local/bin/virtualenvwrapper.sh` to load all the virtualenvwrapper commands into your bash session. The setup scripts also add this to your `~/.bashrc` automatically, so don't worry about it unless you cannot execute any of the following commands.

-  `workon <envname>` to activate a virtualenv (ie `workon ot3`)

- `deactivate` to exit a virtualenv.

- `mkvirtualenv` to create a new one (more info available if you google "virtualenvwrapper".


### Enabling Internet Sharing
**OSX Instructions:**
- Go to System Preferences -> Sharing 
- Inside the "To computers using:" selection, check the box that says "
- If you're using a USB to Ethernet adapter, check the box that says "USB 
- Check the box which says "Internet Sharing" to enable 
- The computer will ask if you are sure you'd like to turn on internet sharing, click "Start"

**Windows Instructions:**
(Viraj says...) I'm unable to test this as I don't have a windows machine, but should be something along the lines of [this tutorial](http://www.countrymilewifi.com/how-to-share-computers-wifi-with-ethernet-devices.aspx).

## Execution and Development
On a configured Pi, from the root directory `~/RPi`, execute `./start.sh`. This will run Crossbar as a background process, sleep for 20 seconds (while Crossbar starts up), and then execute `python ot_client/client.py`, which will start the Python3 client (which uses Autobahn|Asyncio)

`ctrl+c` will kill `client.py` but leave the crossbar server running. This is desirable for development, as the Crossbar server should operate as a black box and not require any tweaking. (The configuration file for Crossbar is located at `RPi/.crossbar/config.yaml`.

`pkill crossbar` will kill Crossbar.

The UI and javascript code are located inside `RPi/ot_server/web/`. Anything inside this directory will be served by Crossbar. Modifying these files will take effect immediately (ie upon browser page refresh, just like any other web development).

**All of the crossbar development can be done locally rather than depending on the raspberry pi**

## Raspberry Pi Wifi / Broadcast Switching Specification

* Out of the box, the Raspberry Pi will use its wifi radio to broadcast a network with the name "opentrons<randomnumber>". 

* The user will be able to connect to this network with default (password: opentrons) credentials. 

* Once the user is connected to the opentrons network, they will be able to navigate to the Pi's web interface being served at the url opentrons.local. 

* (Not yet implemented) If the Pi has wifi credentials, it will attempt to connect over wifi to networks for which it has the credentials.

For broadcasting a wireless network, the Pi will use udhcpd as a dhcp server daemon, and hostapd as an access point daemon. 



