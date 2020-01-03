$(async () => {
  // Cues
  let config = {
    'orbital1+0':{
      star: message => {
        let $image = $('<div class="star" style="background-image: radial-gradient(transparent 50%, black 80%), url(/media/killing-galaxy.jpg)"></div>');
        $image.hide();
        $showtime.html('');
        $showtime.append($image);
        $image.fadeIn(1000);
      }
    },
    'orbital1+1':{

    },
    'orbital2+0':{
    },
    'orbital3+0':{
      star: message => {
        let $image = $('<div class="star" style="background-image: radial-gradient(transparent 50%, black 80%), url(/media/space-stuff.jpeg)"></div>');
        $image.hide();
        $showtime.html('');
        $showtime.append($image);
        $image.fadeIn(1000);
      }

    },
    'xana+46928':{
      star: message => {
        let $image = $('<div class="star" style="background-image: radial-gradient(transparent 50%, black 80%), url(/media/Orion-Nebula-11X14-copy.jpg)"></div>');
        $image.hide();
        $showtime.html('');
        $showtime.append($image);
        $image.fadeIn(1000);
      }
    },
    'hello+world': {
      star: message => {
        console.log('STAR!');
        let $image = $('<div class="star" style="background-image: radial-gradient(transparent 50%, black 80%), url(/media/helix-nebula.jpg)"></div>');
        $image.hide();
        $showtime.html('');
        $showtime.append($image);
        $image.fadeIn(1000);
      }
    }
  };

  // Initialization
  const urlParams = new URLSearchParams(window.location.search);
  const HOSTNAME = urlParams.get('host');
  const DISPLAY_ID = urlParams.get('displayid');
  const DISPLAY_KEY = `${HOSTNAME}+${DISPLAY_ID.slice(0,5)}`;
  const cues = config[DISPLAY_KEY];
  let $showtime = $('#showtime-area');

  // WebSocket connection stuff
  let connection = null;
  setTimeout(function connectWebSocket() {
    connection = new WebSocket(`wss://${location.host}/orbital`);
    connection.onopen = function () {
      console.log('Connection Established!');
    }
    connection.onmessage = onMessage;
    connection.onerror = function (e) {
      console.error('UHOH', e);
      try {
        connection.close();
      } catch (e) {
        onClose();
      }
    };
    connection.onclose = function onClose() {
      console.log('connection closed, retrying in 1 second');
      setTimeout(connectWebSocket, 1000);
    };
  });

  // Message handling
  function onMessage(e) {
    let { data } = e;
    console.log('GOTEM', data);
    let message = JSON.parse(data);
    const messageType = message.address.split('/')[2];
    console.log('MESSAGE TYPE', messageType)
    switch (messageType) {
      case 'showScreen':
        $showtime.addClass('its-showtime');
        const whichScreen = message.address.split('/')[3];
        console.log('WHICH SCREEN', whichScreen);
        switch (whichScreen) {
          case "freezeframe":
            $showtime.html('<div class="freeze-wrapper"><h1>FREEZE!</h1></div>');
            break;
          case "debug":
            $showtime.html(`<div class="debug-wrapper">
              <h1>HOSTNAME: <strong>${HOSTNAME}</strong></h1>
              <h1>DISPLAY_ID: <strong>${DISPLAY_ID}</strong></h1>
            </div>`);
            break;
          default:
            if(cues[whichScreen]){
              cues[whichScreen](message);
            } else {
              console.log(`No screen handler for screen of type: ${whichScreen}`);
            }
        }
        break;
      case 'clearScreen':
        $showtime.removeClass('its-showtime');
        $showtime.html('');
        break;
      case 'fadeScreen':
        let duration = message.args[0] ? message.args[0].value : 500;
        $showtime.fadeOut(duration, () => {
          $showtime.removeClass('its-showtime');
          $showtime.html('');
          requestAnimationFrame(() => $showtime.show());
        });
        break;
      case 'refreshScreen':
        location.reload();
        break;
      default:
        console.log(`No message handler for message of type: ${messageType}`);
    }
  }
});
