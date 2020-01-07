const WebSocket = require('ws');
const uuid = require('uuid/v4');
const path = require('path');
const fs = require('fs').promises;
const osc = require("osc");
const url = require('url');

var getIPAddresses = function () {
  var os = require("os"),
      interfaces = os.networkInterfaces(),
      ipAddresses = [];

  for (var deviceName in interfaces) {
      var addresses = interfaces[deviceName];
      for (var i = 0; i < addresses.length; i++) {
          var addressInfo = addresses[i];
          if (addressInfo.family === "IPv4" && !addressInfo.internal) {
              ipAddresses.push(addressInfo.address);
          }
      }
  }

  return ipAddresses;
};


const orbitalWS = new WebSocket.Server({ noServer: true });
const bestboyWS = new WebSocket.Server({ noServer: true });
const controlWS = new WebSocket.Server({ noServer: true });

orbitalWS.on('connection', function connection(ws) {
  console.log('ORBITAL CONNECTED');
  console.log(`# of orbitals ${orbitalWS.clients.size}`);
});

bestboyWS.on('connection', function connection(ws) {
  console.log('BESTBOY CONNECTED');
});

controlWS.on('connection', async function connection(ws) {
  console.log('CONTROL PANEL CONNECTED');

  let items = await fs.readdir('public/footage/unapproved')
  console.log(items);
  items.map(filename => {
    ws.send(JSON.stringify({
      messageType:'newVideo',
      video:{
        name: filename.split('.')[0],
        uuid: uuid(),
        path: path.join(__dirname, `../public/footage/unapproved/${filename}`)
      }
    }));
  });
  ws.on('message', oscMessage => {
    oscMessage = JSON.parse(oscMessage);
    console.log('OSC MESSAGE (control)', JSON.stringify(oscMessage, null, 4));
    let namespace = oscMessage.address.split('/')[1];
    switch(namespace) {
      case 'orbital':
        orbitalWS.clients.forEach(function each(client) {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(oscMessage));
          }
        });
        break;
      case 'bestboy':
        const bestboyMessage = JSON.stringify({
          messageType: oscMessage.address.split('/')[2],
          recordingName: oscMessage.address.split('/')[3],
          duration: oscMessage.args[0]
        });

        bestboyWS.clients.forEach(function each(client) {
          if (client.readyState === WebSocket.OPEN) {
            client.send(bestboyMessage);
          }
        });
        break;
      default:
        console.log(`No handler for OSC namespace "${namespace}"`)

    }
  });
});

// setInterval(() => {
//   console.log(`# of orbitals ${orbitalWS.clients.size}`);
// }, 1000);

var udpPort = new osc.UDPPort({
  localAddress: "0.0.0.0",
  localPort: 57121
});

udpPort.on("ready", function () {
  var ipAddresses = getIPAddresses();

  console.log("Listening for OSC over UDP.");
  ipAddresses.forEach(function (address) {
      console.log(" Host:", address + ", Port:", udpPort.options.localPort);
  });
});

udpPort.on("message", function (oscMessage) {
  console.log('OSC MESSAGE', JSON.stringify(oscMessage, null, 4));
  let namespace = oscMessage.address.split('/')[1];
  switch(namespace) {
    case 'orbital':
      orbitalWS.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(oscMessage));
        }
      });
      break;
    case 'bestboy':
      const bestboyMessage = JSON.stringify({
        messageType: oscMessage.address.split('/')[2],
        recordingName: oscMessage.address.split('/')[3],
        duration: oscMessage.args[0]
      });

      bestboyWS.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
          client.send(bestboyMessage);
        }
      });
      break;
    default:
      console.log(`No handler for OSC namespace "${namespace}"`)

  }


});

udpPort.on("error", function (err) {
  console.log('OSC ERROR', err);
});

udpPort.open();

module.exports = {
  sendControlMessage: function(message) {
    controlWS.clients.forEach(function each(client) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  },
  wsUpgrade: function(request, socket, head) {
    const pathname = url.parse(request.url).pathname;

    if (pathname === '/orbital') {
      orbitalWS.handleUpgrade(request, socket, head, function done(ws) {
        orbitalWS.emit('connection', ws, request);
      });
    } else if (pathname === '/bestboy') {
      bestboyWS.handleUpgrade(request, socket, head, function done(ws) {
        bestboyWS.emit('connection', ws, request);
      });
    } else if (pathname === '/control') {
      controlWS.handleUpgrade(request, socket, head, function done(ws) {
        controlWS.emit('connection', ws, request);
      });
    } else {
      socket.destroy();
    }
  }
}
