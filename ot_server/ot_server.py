from twisted.internet.defer import inlineCallbacks
from autobahn.twisted import wamp

class AppSession(wamp.ApplicationSession):
    '''
    This is the component which 
    '''

    @inlineCallbacks
    def onJoin(self, details):

        self.received = 0
        def on_event(i):
            print("Got event: {}".format(i))
            self.received += 1
        yield self.subscribe(on_event, 'com.opentrons.counter')

