const WebSocket = require('ws');
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
const wss2 = new WebSocket.Server({ noServer: true });

orbitalWS.on('connection', function connection(ws) {
  console.log('ORBITAL CONNECTED');
});

wss2.on('connection', function connection(ws) {
  // ...
});



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
  console.log('OSC MESSAGE', oscMessage);
  orbitalWS.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(oscMessage);
    }
  });
});

udpPort.on("error", function (err) {
  console.log('OSC ERROR', err);
});

udpPort.open();

module.exports = function wsUpgrade(request, socket, head) {
  const pathname = url.parse(request.url).pathname;

  if (pathname === '/orbital') {
    orbitalWS.handleUpgrade(request, socket, head, function done(ws) {
      orbitalWS.emit('connection', ws, request);
    });
  } else if (pathname === '/bar') {
    wss2.handleUpgrade(request, socket, head, function done(ws) {
      wss2.emit('connection', ws, request);
    });
  } else {
    socket.destroy();
  }
};
