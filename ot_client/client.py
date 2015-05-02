import sys
import asyncio
from autobahn.asyncio import wamp, websocket
import otBackend 

class WampComponent(wamp.ApplicationSession):

    """
    Application code goes here. This is an example component that calls
    a remote procedure on a WAMP peer, subscribes to a topic to receive
    events, and then stops the world after some events.
    """

    def onConnect(self):
        self.join(u"ot_realm")

    @asyncio.coroutine
    def onJoin(self, details):

        # subscribe to a topic
        self.subscribe(otBackend.handleEvent, 'com.opentrons.event')

        # register a function
        self.register(otBackend.time, 'com.opentrons.time')

        # publish to a topic repeatedly
        counter = 0
        while True:
            print("publishing " + str(counter))
            self.publish('com.opentrons.counter', counter)
            counter += 1
            yield from asyncio.sleep(1)

    def onLeave(self, details):
        self.disconnect()

    def onDisconnect(self):
        asyncio.get_event_loop().stop()


if __name__ == '__main__':

    # 1) create a WAMP application session factory
    session_factory = wamp.ApplicationSessionFactory()
    session_factory.session = WampComponent

    # 2) create a WAMP-over-WebSocket transport client factory
    url = "ws://127.0.0.1:8080/ws"
    transport_factory = websocket \
                .WampWebSocketClientFactory(session_factory,
                                            url=url,
                                            debug=False,
                                            debug_wamp=False)

    # 3) start the client
    loop = asyncio.get_event_loop()
    coro = loop.create_connection(transport_factory, '127.0.0.1', 8080)
    loop.run_until_complete(coro)

    # 4) now enter the asyncio event loop
    loop.run_forever()
    loop.close()
