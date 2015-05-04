# This is a dummy backend, the place where all the 
# code which talks to the smoothieboard and so on would be located
import datetime

# test function which takes a value and prints
def receiveMessage(msg):
    print("Got event: {}".format(msg))

# test function which returns a value
def time():
    now = datetime.datetime.utcnow()
    nowStr = now.strftime("%Y-%m-%dT%H:%M:%SZ")
    print("current time: " + nowStr)
    return nowStr
