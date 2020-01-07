$(async () => {
  // Cues
  let displayDict = {
    'orbital1+0': 'houseright',
    'orbital1+1': 'ceiling',
    'orbital2+0': 'stageleft',
    'orbital3+0': 'houseleft',
    'commodore+686407758': 'mainpanel',
    'commodore+551129421': 'stageright',
    'commodore+0': 'mainpanel',
    'commodore+1': 'stageright',
    'hello+world': 'local',
    'hobknob+0': 'stageleft'
  }
  let config = {
    houseleft:{
      star: message => {
        let $image = $('<div class="star" style="background-image: radial-gradient(transparent 50%, black 80%), url(/media/killing-galaxy.jpg)"></div>');
        $image.hide();
        $showtime.html('');
        $showtime.append($image);
        $image.fadeIn(1000);
      }
    },
    ceiling:{

    },
    local: {
      censor1: message => {
        $showtime.html(`<div class="iphone-wrapper left" style="margin-top: 0">
        <div class="iphone-clock">9:10</div>
        <div class="icon-tray">
          <i class="material-icons">signal_cellular_alt</i>
          <i class="material-icons">wifi</i>
          <i class="material-icons battery-indicator">battery_full</i>
        </div>
        <iframe class="iphone-app" src="/apps/censor.html"></iframe>
      </div>`);
      },
    },
    stageleft:{
      census: message => {
        $showtime.html(`<iframe class="fullscreen-frame" src="/apps/surveillance.html?display=stageleft"></iframe>`);
      },
      star: message => {
        let $image = $('<div class="star" style="background-image: radial-gradient(transparent 50%, black 80%), url(/media/Orion-Nebula-11X14-copy.jpg)"></div>');
        $image.hide();
        $showtime.html('');
        $showtime.append($image);
        $image.fadeIn(1000);
      }
    },
    houseright:{
      star: message => {
        let $image = $('<div class="star" style="background-image: radial-gradient(transparent 50%, black 80%), url(/media/space-stuff.jpeg)"></div>');
        $image.hide();
        $showtime.html('');
        $showtime.append($image);
        $image.fadeIn(1000);
      }

    },
    mainpanel: {
      intro: message => {
        $showtime.html(`<iframe class="fullscreen-frame" src="/apps/intro-title.html"></iframe>`);
      },
      fan: message => {
        $showtime.html(`<div class="iphone-wrapper">
        <div class="iphone-clock">9:10</div>
        <div class="icon-tray">
          <i class="material-icons">signal_cellular_alt</i>
          <i class="material-icons">wifi</i>
          <i class="material-icons battery-indicator">battery_full</i>
        </div>
        <iframe class="iphone-app" src="/apps/fan-iphone.html"></iframe>
      </div>`);
      },
      torture: message => {
        $showtime.html(`<iframe class="fullscreen-frame" src="/apps/torture.html"></iframe>`);
      },
      irrational: message => {
        $showtime.html(`<div class="safe-area"><video class="fullwidth" src="/media/tv-palooza.mp4" autoplay></video></div>`);
        $('video').on('ended', () => {
          $showtime.html('');
        })
      },
      dream: message => {
        $showtime.html(`<div class="safe-area"><video class="fullwidth" src="/media/Dream.mp4" autoplay></video></div>`);
        $('video').on('ended', () => {
          $showtime.html('');
        })
      },
      god: message => {
        $showtime.html(`<div class="safe-area"><video class="fullwidth" src="/media/god.mp4" autoplay></video></div>`);
        $('video').on('ended', () => {
          $showtime.html('');
        })
      },
      recluse: message => {
        $showtime.html(`
        <div class="iphone-wrapper">
          <div class="iphone-clock">9:10</div>
          <div class="icon-tray">
            <i class="material-icons">signal_cellular_alt</i>
            <i class="material-icons">wifi</i>
            <i class="material-icons battery-indicator">battery_full</i>
          </div>
          <iframe class="iphone-app" src="/apps/ding-projection.html"></iframe>
        </div>
      `);
      },
      star: message => {
        console.log('STAR!');
        let $image = $('<div class="star" style="background-image: radial-gradient(transparent 50%, black 80%), url(/media/helix-nebula.jpg)"></div>');
        $image.hide();
        $showtime.html('');
        $showtime.append($image);
        $image.fadeIn(1000);
      },
      'wedding-video': message => {
        $showtime.html(`<iframe class="fullscreen-frame" src="/apps/wedding-video.html"></iframe>`);
      },
      grief: message => {
        $showtime.html(`<div class="iphone-wrapper">
        <div class="iphone-clock">9:10</div>
        <div class="icon-tray">
          <i class="material-icons">signal_cellular_alt</i>
          <i class="material-icons">wifi</i>
          <i class="material-icons battery-indicator">battery_full</i>
        </div>
        <iframe class="iphone-app" src="/apps/grief.html"></iframe>
      </div>`);
      },
      censor: message => {
        $showtime.html(`<div class="iphone-wrapper left">
        <div class="iphone-clock">9:10</div>
        <div class="icon-tray">
          <i class="material-icons">signal_cellular_alt</i>
          <i class="material-icons">wifi</i>
          <i class="material-icons battery-indicator">battery_full</i>
        </div>
        <iframe class="iphone-app" src="/apps/censor.html"></iframe>
      </div>`);
      },
      'chinese-poetry': message => {
        $showtime.html(`<iframe class="fullscreen-frame" src="/apps/chinese-poetry.html"></iframe>`);
      },
      virtual: message => {
        $showtime.html(`<iframe class="fullscreen-frame" src="/apps/virtual.html"></iframe>`);
      },
      'small-thing': message => {
        $showtime.html(`
        <div class="iphone-wrapper left">
          <div class="iphone-clock">9:10</div>
          <div class="icon-tray">
            <i class="material-icons">signal_cellular_alt</i>
            <i class="material-icons">wifi</i>
            <i class="material-icons battery-indicator">battery_full</i>
          </div>
          <iframe class="iphone-app" src="/apps/ding-projection.html"></iframe>
        </div>
      `);
      },
    },
    stageright: {
      census: message => {
        $showtime.html(`<iframe class="fullscreen-frame" src="/apps/surveillance.html?display=stageright"></iframe>`);
      },
      star: message => {
        console.log('STAR!');
        let $image = $('<div class="star" style="background-image: radial-gradient(transparent 50%, black 80%), url(/media/goggles-nebula.jpg)"></div>');
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
  const DISPLAY_KEY = `${HOSTNAME}+${DISPLAY_ID}`;
  const displayName = displayDict[DISPLAY_KEY]
  const cues = config[displayName];
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
              <h1>NAME: <strong>${displayName}</strong></h1>
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
