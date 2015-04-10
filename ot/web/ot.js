   var wsuri;
   if (document.location.origin == "file://") {
      wsuri = "ws://127.0.0.1:8080/ws";

   } else {
      wsuri = (document.location.protocol === "http:" ? "ws:" : "wss:") + "//" +
                  document.location.host + "/ws";
   }

   // the WAMP connection to the Router
   //
   var connection = new autobahn.Connection({
      url: wsuri,
      realm: "realm1"
   });

    connection.onopen = function(session) {
      connection.session.subscribe('com.example.new_name', function(name) {
        main.setState({name: name});
      });
    };

    connection.open();

    $(document).on('click', '#socket-form button', function() {
      var newName = $('#socket-form #name').val();
      connection.session.publish('com.example.change_name', [newName]);
    });
