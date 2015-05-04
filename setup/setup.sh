#!/bin/bash

# install things as root
sudo ./setupSystem.sh

# create two virtualenvs as the regular user
./setupPythonEnvironment.sh
