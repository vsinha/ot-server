# RPi
RPi Communication Hub

To run:

Create a virtualenv under python 2 and activate it (perhaps named "ot2")
```mkvirtualenv --python=python2.7 ot2```
```workon ot2```
```pip install -r python2_requirements.txt```
```crossbar start```
This will install crossbar and relies on python2: we will run crossbar in this python2 environment

Now open a new terminal and create a python3 virtualenv
```mkvirtualenv --python=python3.4 ot3```
```workon ot3```
```pip install -r python3 requirements.txt```
```python ot_client/client.py
This will install autobahn with python3 bindings, we will write the actual application code in here

Finally, load localhost:8080 in the browser
