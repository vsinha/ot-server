// Set up the URL to connect to 
var wsuri;
if (document.location.origin == "file://") {
   wsuri = "ws://127.0.0.1:8080/ws";

} else {
   wsuri = (document.location.protocol === "http:" ? "ws:" : "wss:") + "//" +
      document.location.host + "/ws";
}

// Initialize the WAMP connection to the Router
var connection = new autobahn.Connection({
   url: wsuri,
   realm: "ot_realm"
});

// When we open the connection, subsribe and register any protocols
connection.onopen = function(session) {
   connection.session.subscribe('com.opentrons.counter', function(str) {
      main.setState({name: str});
   });
   connection.session.subscribe('com.opentrons.counter', function(str) {
      main.setState({name: str});
   });
};

connection.open();

// handle button clicks
$(document).on('click', '#socket-form button', function() {
   var newName = $('#socket-form #name').val();

   connection.session.publish(
      'com.opentrons.execremoteProcedure', 
      [newName]);
});
