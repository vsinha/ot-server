/////////////////////////////////
/////////////////////////////////
/////////////////////////////////

var globalConnection;

window.addEventListener ('load', function () {

  // Initialise the server/router url based off where this file came from
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

  // Make connection accessible across the entire document
  globalConnection = connection

  connection.onclose = function () {
    setStatus('Warning: Browser not connected to the server','red');
  }

  // When we open the connection, subsribe and register any protocols
  connection.onopen = function(session) {

    setStatus('Browser connected to server','rgb(27,225,100)');

    // Subscribe and register all function end points we offer from the
    // javascript to the other clients (ie python)
    // The functions below demonstrate some of the syntax
    connection.session.subscribe('com.opentrons.counter', function(str) {
        console.log("Counter value: " + str);
    });

    // handle button clicks
    $(document).on('click', '#socket-form button', function() {
        var message = $('#socket-form #message').val();
        connection.session.publish('com.opentrons.event', [message]);
    });

    $(document).on('click', '#time-form button', function() {
      console.log("butan");
      session.call('com.opentrons.time', []).then(
          function (t) {
            $("#time-form #timeField").text(t);
          }
      );
    });
  };

  connection.open();
});

/////////////////////////////////
/////////////////////////////////
/////////////////////////////////

var theContainerLocations = {};

function handleContainers (newContainers) {

  for(var axis in newContainers){
    try{
      theContainerLocations[axis] = newContainers[axis];
    }catch(err){
      console.log(err);
      theContainerLocations[axis] = newContainers[axis];
    }
  }

  var containerMenu = document.getElementById('containerMenu');
  var kidOptions = containerMenu.children;

  // remove all containers from containerMenu 
  // that are not in theContainerLocations.a
  // why only a, what about b???
  for(var k = 0; k < kidOptions.length; k++) {
    var oldKidName = kidOptions[k].innerHTML;
    if(!theContainerLocations.a[oldKidName]) {
      containerMenu.removeChild(kidOptions[k]);
      k--;
    }
  }

  for(var name in theContainerLocations.a) {
    var foundIt = false;
    for(var k = 0; k < kidOptions.length; k++) {
      if(kidOptions[k].value===name) {
        foundIt = true;
        break;
      }
    }
    if(!foundIt) {
      var containerOption = document.createElement('option');
      containerOption.value = name;
      containerOption.innerHTML = name;
      containerMenu.appendChild(containerOption);
    }
  }
}



////////////
////////////
////////////

function saveContainer (axis) {

  var contName = document.getElementById('containerMenu').value;

  calibrateContainer(axis, contName);
}

////////////
////////////
////////////

function movetoContainer (axis) {
  var contName = document.getElementById('containerMenu').value;

  var thisLoc = theContainerLocations[axis][contName];

  var moveArray = [];

  moveArray.push({
    'z' : 0
  });
  moveArray.push({
    'x' : thisLoc.x,
    'y' : thisLoc.y
  });
  moveArray.push({
    'z' : thisLoc.z
  });

  var msg = {
    'type' : 'move',
    'data' : moveArray
  }

  sendMessage(msg);
}

/////////////////////////////////
/////////////////////////////////
/////////////////////////////////

var lineCount = 0;
var lineLimit = 500; // If this number is too big bad things happen

var socketHandler = {
  'smoothie' : (function(){

    var previousMessage = undefined;

    return function (data) {

      if(data.string!==previousMessage) {

        if(data.string.indexOf('{')>=0){
          try {
            var coordMessage = JSON.parse(data.string);
            if(!isNaN(coordMessage.x)) {
              document.getElementById('position_x').innerHTML = coordMessage.x.toFixed(2);
              robotState.x = coordMessage.x;
            }
            if(!isNaN(coordMessage.y)) {
              document.getElementById('position_y').innerHTML = coordMessage.y.toFixed(2);
              robotState.y = coordMessage.y;
            }
            if(!isNaN(coordMessage.z)) {
              document.getElementById('position_z').innerHTML = coordMessage.z.toFixed(2);
              robotState.z = coordMessage.z;
            }
            if(!isNaN(coordMessage.a)) {
              document.getElementById('position_a').innerHTML = coordMessage.a.toFixed(2);
              robotState.a = coordMessage.a;
            }
            if(!isNaN(coordMessage.b)) {
              //document.getElementById('position_b').innerHTML = coordMessage.b.toFixed(2);
              robotState.b = coordMessage.b;
            }
          }
          catch(e) {
            console.log(e);
          }
        }

        previousMessage = data.string;

        var printer = document.getElementById('print');

        var brk = document.createElement('br');
        printer.appendChild(brk);

        var span;
        if(data.string.indexOf('-->')>=0) span = document.createElement('strong');
        else span = document.createElement('span');
        
        lineCount++;
        span.innerHTML = lineCount+': ';
        span.innerHTML += data.string;
        printer.appendChild(span);

        var h = printer.scrollHeight;
        printer.scrollTop = h;

        while(printer.childElementCount > lineLimit ){
          printer.removeChild(printer.firstChild);
        }
      }
    }
  })(),

  'coordinates' : function (data) {
    console.log(data);
  },
  'status' : function (data) {
    setStatus(data.string,data.color);
  },
  'pipetteValues' : function (data) {
    for(var axis in data) {
      robotState.pipettes[axis].top = data[axis].top || robotState.pipettes[axis].top;
      robotState.pipettes[axis].bottom = data[axis].bottom || robotState.pipettes[axis].bottom;
      robotState.pipettes[axis].blowout = data[axis].blowout || robotState.pipettes[axis].blowout;
      robotState.pipettes[axis].droptip = data[axis].droptip || robotState.pipettes[axis].droptip;
      robotState.pipettes[axis].volume = data[axis].volume || robotState.pipettes[axis].volume;

      try{
        document.getElementById('pipetteVolume_'+axis).innerHTML = robotState.pipettes[axis].volume.toFixed(2);
      }
      catch(e){}
    }
  },
  'containerLocations' : function (data) {
    handleContainers(data);
  },
  'refresh' : function(data) {
    refresh();
  }
};

/////////////////////////////////
/////////////////////////////////
/////////////////////////////////

function sendMessage (msg) {
  console.log("sending message: " + JSON.stringify(msg));
  globalConnection.session.publish('com.opentrons.sendMessage', [JSON.stringify(msg)]);
}

/////////////////////////////////
/////////////////////////////////
/////////////////////////////////

function setStatus (string,color) {
  if (string) {
    document.getElementById('status').innerHTML = string;
    document.getElementById('status').style.color = color;
  }
}

/////////////////////////////////
/////////////////////////////////
/////////////////////////////////

var robotState = {
  'x' : 0,
  'y' : 0,
  'z' : 0,
  'a' : 0,
  'b' : 0,
  'pipettes' : {
    'a' : {
      'top' : 0,
      'bottom' : 0,
      'blowout' : 0,
      'droptip' : 0,
      'volume' : 200 // defaults to 200uL, why not?
    },
    'b' : {
      'top' : 0,
      'bottom' : 0,
      'blowout' : 0,
      'droptip' : 0,
      'volume' : 200
    }
  },
  'stat' : 0
}

/////////////////////////////////
/////////////////////////////////
/////////////////////////////////

function home () {

  var menu = document.getElementById('homeMenu');
  var axe = JSON.parse(menu.options[menu.selectedIndex].value);
  var msg = {
    'type' : 'home',
    'data': axe
  };

  sendMessage(msg);
}

////////////
////////////
////////////

function pause () {

  var msg = {
    'type' : 'pauseJob'
  };

  sendMessage(msg);
}

////////////
////////////
////////////

function resume () {

  var msg = {
    'type' : 'resumeJob'
  };

  sendMessage(msg);
}

////////////
////////////
////////////

function erase () {

  var msg = {
    'type' : 'eraseJob'
  };

  document.getElementById('fileName').innerHTML = '';
  document.getElementById('dragDiv').style.display = 'block';
  document.getElementById('dragDiv').style.backgroundColor = 'white';
  document.getElementById('runButton').style.display = 'none';

  CURRENT_PROTOCOL = undefined;

  sendMessage(msg);
}

////////////
////////////
////////////

function setSpeed (axis,value) {

  var div = document.getElementById('speed_'+axis);
  if(div){
    value = value || div.value || 300;
    var msg = {
      'type' : 'speed',
      'data' : {
        'axis' : axis,
        'value' : value
      }
    };

    sendMessage(msg);
  }
}

////////////
////////////
////////////

function calibrate (axis, property) {

  var msg = {
    'type' : 'calibrate',
    'data' : {
      'axis' : axis,
      'property' : property
    }
  };

  sendMessage(msg);

  if(robotState.pipettes[axis] && !isNaN(robotState.pipettes[axis][property])) {
    robotState.pipettes[axis][property] = robotState[axis];

    if(property==='blowout') {
      robotState.pipettes[axis]['bottom'] = robotState.pipettes[axis]['blowout'] - 2;
    }
  }
}

////////////
////////////
////////////

function movePipette(axis,property) {

  setSpeed(axis);

  var msg = {
    'type' : 'movePipette',
    'data' : {
      'axis' : axis,
      'property' : property
    }
  };

  sendMessage(msg);
}

function shakePipette(axis) {
  sendMessage({
    'type' : 'movePlunger',
    'data' : {
      'axis' : axis,
      'locations' : [
        {
          'speed' : 500
        },
        {
          'plunger' : '1'
        },
        {
          'a' : '1',
          'relative' : true
        },
        {
          'plunger' : 'resting'
        },
        {
          'speed' : 300
        }
      ]
    }
  });
}

////////////
////////////
////////////

var slotPositions = {
  'numbers' : {
    '1' : 320,
    '2' : 190,
    '3' : 50
  },
  'letters' : {
    'A' : 20,
    'B' : 120,
    'C' : 220,
    'D' : 320,
    'E' : 360
  }
}

function moveSlot(slotName) {
  var letter = slotName.charAt(0);
  var number = slotName.charAt(1);

  var yPos = slotPositions.numbers[number];
  var xPos = slotPositions.letters[letter];

  if(xPos && yPos) {

    var moveArray = [];

    moveArray.push({
      'z' : 0
    });
    moveArray.push({
      'x' : xPos,
      'y' : yPos
    });

    var msg = {
      'type' : 'move',
      'data' : moveArray
    }

    sendMessage(msg);
  }
}

////////////
////////////
////////////

function moveVolume (axis) {
  var volumeMenu = document.getElementById('volume_'+axis);
  var volume = volumeMenu ? volumeMenu.value : undefined;

  if(volume) {

    volume *= -1; // negative because we're just sucking up right now

    // deduce the percentage the plunger should move to
    var totalPipetteVolume = robotState.pipettes[axis].volume;
    if(!totalPipetteVolume) totalPipetteVolume = 200;
    if(!isNaN(totalPipetteVolume)) {
      var plungerPercentage = volume / totalPipetteVolume;

      console.log('moving to '+plungerPercentage);

      sendMessage({
        'type' : 'movePlunger',
        'data' : {
          'axis' : axis,
          'locations' : [
            {
              'z' : -20,
              'relative' : true
            },
            {
              'speed' : 500
            },
            {
              'plunger' : 'blowout'
            },
            {
              'plunger' : .9
            },
            {
              'plunger' : .8
            },
            {
              'plunger' : .9
            },
            {
              'plunger' : .8
            },
            {
              'plunger' : .9
            },
            {
              'plunger' : .8
            },
            {
              'plunger' : .9
            },
            {
              'z' : 20,
              'relative' : true
            },
            {
              'plunger' : 1
            },
            {
              'speed' : 600
            },
            {
              'plunger' : 1 + plungerPercentage // say 1+ because we're backing off from 1 right now
            }
          ]
        }
      });
    }
    else {
      alert('Please calibrate pipette volume first');
    }
  }
}


////////////
////////////
////////////

function saveVolume (axis) {

  var volumeMenu = document.getElementById('volume_'+axis);
  var volume = volumeMenu ? volumeMenu.value : undefined;

  if(volume) {

    // find the percentage we've moved between "bottom" and "top"
    var totalDistance = robotState.pipettes[axis].bottom - robotState.pipettes[axis].top;
    var distanceFromBottom = robotState.pipettes[axis].bottom - robotState[axis];
    var percentageFromBottom = distanceFromBottom / totalDistance;

    console.log('saved at '+percentageFromBottom);

    // determine the number of uL this pipette can do based of percentage
    var totalVolume = volume / percentageFromBottom;

    if(!isNaN(totalVolume) && totalVolume>0) {

      document.getElementById('pipetteVolume_'+axis).innerHTML = totalVolume.toFixed(2);
      robotState.pipettes[axis].volume = totalVolume;

      sendMessage({
        'type':'saveVolume',
        'data': {
          'volume':totalVolume,
          'axis':axis
        }
      });
    }
    else  {
      alert('error saving new volume, check the pipette\'s coordinates');
    }
  }
}

////////////
////////////
////////////

function pickupTip(axis) {
  if(CURRENT_PROTOCOL && CURRENT_PROTOCOL.head) {
    for(var pipetteName in CURRENT_PROTOCOL.head) {
      if(CURRENT_PROTOCOL.head[pipetteName].axis===axis) {
        var plungeAmount = CURRENT_PROTOCOL.head[pipetteName]['tip-plunge'] || 0;

        var msg = {
          'type' : 'step',
          'data' : [
            {'z': plungeAmount},
            {'z': -1*plungeAmount},
            {'z': plungeAmount},
            {'z': -1*plungeAmount},
            {'z': plungeAmount},
            {'z': -1*plungeAmount}
          ]
        };

        sendMessage(msg);
      }
    }
  }
  else {
    alert('Load a protocol file before using "Pickup-Tip"');
  }
}

////////////
////////////
////////////

function calibrateContainer (axis, containerName) {
  if ('ab'.indexOf(axis)>=0) {
    var msg = {
      'type' : 'calibrate',
      'data' : {
        'axis' : axis,
        'property' : containerName
      }
    };

    sendMessage(msg);
  }
}

////////////
////////////
////////////

function step (axis, multiplyer) {
  var msg = {
    'type' : 'step',
    'data' : {}
  };

  if(axis==='a' || axis==='b') setSpeed(axis);

  var allAxis = 'xyzab';

  if(axis && !isNaN(multiplyer) && allAxis.indexOf(axis) >= 0) {
    var stepSize;
    if(axis==='a') stepSize = document.getElementById('stepSize_a').value;
    else if(axis==='b') stepSize = document.getElementById('stepSize_b').value;
    else if(axis==='z') stepSize = document.getElementById('stepSize_z').value;
    else stepSize = document.getElementById('stepSize_xy').value;
    if(!isNaN(stepSize)) {
      stepSize *= multiplyer;
      msg.data[axis] = stepSize;
      sendMessage(msg);
    }
  }
}

/////////////////////////////////
/////////////////////////////////
/////////////////////////////////

function sendDebugCommand () {
  var text = document.getElementById('debugCommandInput').value;

  var msg = {
    'type' : 'raw',
    'data' : text
  };

  document.getElementById('debugCommandInput').value = '';

  sendMessage(msg);
}

function updateCommand () {
  var ssid = document.getElementById('ssidInput').value;
  var pwd = document.getElementById('pwdInput').value;

  var msg = {
    'type' : 'update',
    'data' : {
      'ssid' : ssid,
      'password' : pwd
    }
  };
  var popupBlock = document.getElementById('popUpDiv');
  while(popupBlock.firstChild){
    popupBlock.removeChild(popupBlock.firstChild);
  }
  var updaterLabel = document.createElement('span');
  popupBlock.appendChild(updaterLabel);
  updaterLabel.innerHTML = "TRYING TO UPDATE...\r\nthis page will automatically refresh in 60 seconds";

  setTimeout(function(){refresh();},60000);

  sendMessage(msg);
}

function refresh () {
  window.location.reload();
}


