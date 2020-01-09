$(() => {
  // WebSocket connection stuff
  let connection = null;
  setTimeout(function connectWebSocket() {
    connection = new WebSocket(`wss://${location.host}/control`);
    connection.onopen = function () {
      console.log('Connection Established!');
    }
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

  $('#mute-toggle').on('click', () => {
    if(connection) {
      console.log('WE HAVE A CONNECTION, TOGGLING MUTE')
      connection.send(JSON.stringify({
        address: '/orbital/toggle-mute',
        args: []
      }));
    }
  });
});
