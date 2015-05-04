#!/bin/bash

# install things as root
sudo ./setupscriptRoot.sh

# create two virtualenvs as the regular user
./setupPythonEnvironment.sh
