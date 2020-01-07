$(async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const DISPLAY = urlParams.get('display');
  $('.footage-area').append(`<h1>SURVEILLANCE</h1><h1>${DISPLAY}</h1>`);
  if(DISPLAY === 'stageleft') {
    $('.footage-area').html(`<video class="footage" src="/footage/approved/audience1.mp4" muted autoplay loop></video>`)
  }
  if(DISPLAY === 'stageright') {
    $('.footage-area').html(`<video class="footage" src="/footage/approved/audience2.mp4" muted autoplay loop></video>`)
  }


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
      case 'endCensus':
        if(DISPLAY === 'stageleft') {
          $('video').fadeOut(1000);
        }
        break;
      case 'showTorture':
        if(DISPLAY === 'stageright') {
          $('.footage-area').html(`<video class="footage" src="/media/torture.mp4" muted autoplay></video>`)
        }
        break;
      case 'refreshScreen':
        location.reload();
        break;
      default:
        console.log(`No message handler for message of type: ${messageType}`);
    }
  }
});
