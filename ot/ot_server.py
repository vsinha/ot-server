from twisted.internet.defer import inlineCallbacks
from autobahn.twisted.wamp import ApplicationSession


class AppSession(ApplicationSession):

    @inlineCallbacks
    def onJoin(self, details):
        def change_name(new_name):
            print("new name: " + new_name)
            self.publish('com.example.new_name', new_name)

        yield self.subscribe(change_name, 'com.example.change_name')
