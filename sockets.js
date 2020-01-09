const WebSocket = require('ws');
const uuid = require('uuid/v4');
const path = require('path');
const fs = require('fs').promises;
const osc = require("osc");
const url = require('url');
const del = require('del');

const { exec } = require('child_process');

const rtcSignals = require('./util/rtc-signals');

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

  try {
    let items = await fs.readdir('public/footage/unapproved')
    console.log(items);
    items.map(filename => {
      if(filename !== '.DS_Store'){
        ws.send(JSON.stringify({
          messageType:'newVideo',
          video:{
            name: filename.split('.')[0],
            uuid: uuid(),
            path: path.join(__dirname, `../public/footage/unapproved/${filename}`)
          }
        }));
      }
    });
  } catch(e) {
    console.log('Looks like theres no footage yet');
  }
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
      case 'informator':
        handleMessage(oscMessage);
        break;
      default:
        console.log(`No handler for OSC namespace "${namespace}"`)

    }
  });
});

async function handleMessage(message) {
  let command = message.address.split('/')[2];
  switch(command) {
    case 'clear-rtc':
      rtcSignals.offer = {};
      rtcSignals.answer = {};
      break;
    case 'record-stage':
      let name =message.address.split('/')[3];

      let unapprovedFolder = path.join(__dirname, `./public/footage/unapproved`);
      await fs.mkdir(unapprovedFolder, { recursive: true })
      var yourscript = exec(`./record.sh ${message.address.split('/')[3]} ${message.args[0] || 10}`,
        (error, stdout, stderr) => {
            console.log(stdout);
            console.log(stderr);
            if (error !== null) {
                console.log(`exec error: ${error}`);
            } else {
              controlWS.clients.forEach(function each(client) {
                if (client.readyState === WebSocket.OPEN) {
                  client.send(JSON.stringify({
                    messageType:'newVideo',
                    video:{
                      name,
                      uuid: uuid(),
                      path: path.join(__dirname, `../public/footage/unapproved/${name}.mp4`)
                    }
                  }));
                }
              });
            }
        });
      break;
    case 'concat-videos':
      exec(`./concat.sh`,
        (error, stdout, stderr) => {
            console.log(stdout);
            console.log(stderr);
            if (error !== null) {
                console.log(`exec error: ${error}`);
            }
        });
      break;
    case 'delete-footage':
      const deletedPaths = await del('public/footage');
      console.log('Footage deleted!' ,deletedPaths)
      break;
    default:
      console.log(`No handler for OSC command "${command}"`)

  }
}

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
    case 'informator':
      handleMessage(oscMessage);
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
