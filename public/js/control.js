$(async () => {
  let connection = null;
  setTimeout(function connectWebSocket() {
    connection = new WebSocket(`wss://${location.host}/control`);
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

  $('#bail').on('click', () => {
    console.log('BAIL')
    connection.send(JSON.stringify({
      address: '/orbital/clearScreen',
      args: []
    }));
  });

  $('#refresh').on('click', () => {
    connection.send(JSON.stringify({
      address: '/orbital/refreshScreen',
      args: []
    }));
  });

  $('#debug').on('click', () => {
    connection.send(JSON.stringify({
      address: '/orbital/showScreen/debug',
      args: []
    }));
  });

  $('#callmanual').on('click', () => {
    let cue = $('#manualcue').val();
    // $('#manualcue').val('');
    connection.send(JSON.stringify({
      address: cue.split(' ')[0],
      args: cue.split(' ').slice(1)
    }));
  });

  let unapprovedVideos = [];
  // Message handling
  function onMessage(e) {
    let { data } = e;
    console.log('GOTEM', data);
    let message = JSON.parse(data);
    console.log('MESSAGE TYPE', message.messageType)
    switch (message.messageType) {
      case 'newVideo':
        unapprovedVideos.push(message.video);
        renderVideoList();
        break;
      default:
        console.log(`No message handler for message of type: ${messageType}`);
    }
  }

  function renderVideoList() {
    let $list = $('#new-videos');
    $list.html('');
    unapprovedVideos.map(video => {
      let $video = $(`<li>${video.name}</li>`);
      $video.on('click', e => {
        fetch(`/upload/render/${video.name}`);
        unapprovedVideos = unapprovedVideos.filter(vid => vid.uuid !== video.uuid);
        renderVideoList();
      })
      $list.append($video);
    });
  }
});
