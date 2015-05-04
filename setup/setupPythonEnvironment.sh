#!/bin/bash

source /usr/local/bin/virtualenvwrapper.sh

setupPythonEnvs() {
  export WORKON_HOME=$HOME/.virtualenvs
  source /usr/local/bin/virtualenvwrapper.sh
  echo "source /usr/local/bin/virtualenvwrapper.sh" >> ~/.bashrc
  echo "export WORKON_HOME=$HOME/.virtualenvs" >> ~/.bashrc

  echo "Creating and configuring python2 requirements"
  mkvirtualenv -p python ot2
  workon ot2
  pip install -r python2_requirements.txt
  deactivate

  echo "Creating and configuring python3 requirements"
  mkvirtualenv -p python3 ot3
  workon ot3
  pip install -r python3_requirements.txt
  deactivate
}

setupPythonEnvs
