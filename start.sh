#!/bin/bash

source /usr/local/bin/virtualenvwrapper.sh

workon ot2
#crossbar start > crossbar.log 2>&1 &
crossbar start &
deactivate

# wait for crossbar to start up
# TODO: Daemonize crossbar: http://crossbar.io/docs/Automatic-startup-and-restart/
sleep 20s

workon ot3
python ot_client/client.py
# continue on in ot3 virtualenv
