/* See also:
    http://www.html5rocks.com/en/tutorials/webrtc/basics/
    https://code.google.com/p/webrtc-samples/source/browse/trunk/apprtc/index.html

    https://webrtc-demos.appspot.com/html/pc1.html
*/
var iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

var seriously, source, target, lumakey;
var isLumaKeyed = false, isShowing = false;
const SIGNALMASTER = `https://${location.host}/signalmaster`;
navigator.getUserMedia = navigator.getUserMedia ||
  navigator.webkitGetUserMedia ||
  navigator.mozGetUserMedia ||
  navigator.msGetUserMedia;


// var cfg = { 'iceServers': [{ 'url': 'stun:23.21.150.121' }] },
var cfg = { 'iceServers': [] },
  con = { 'optional': [{ 'DtlsSrtpKeyAgreement': true }] }

/* THIS IS ALICE, THE CALLER/SENDER */

var pc1 = new RTCPeerConnection(cfg, con),
  dc1 = null, tn1 = null

// Since the same JS file contains code for both sides of the connection,
// activedc tracks which of the two possible datachannel variables we're using.
var activedc

var pc1icedone = false

const urlParams = new URLSearchParams(window.location.search);
var sdpConstraints = {
  optional: [],
  mandatory: {
    OfferToReceiveAudio: true,
    OfferToReceiveVideo: true
  }
}

setTimeout(createLocalOffer);

async function createLocalOffer() {
  console.log('video1')

  try {
    pc1 = new RTCPeerConnection(cfg, con)
    pc1.onsignalingstatechange = onsignalingstatechange
    pc1.oniceconnectionstatechange = oniceconnectionstatechange
    pc1.onicegatheringstatechange = onicegatheringstatechange
    pc1.onicecandidate = onIceCandidate
    pc1.ontrack = onTrack;

    let deviceInfos = await navigator.mediaDevices.enumerateDevices();
    console.log('DEVICES', deviceInfos);
    let audioDevice = deviceInfos.filter(device => device.kind === 'audioinput' && device.label.indexOf('USB 2.0 Camera') !== -1)[0];
    let videoDevice = deviceInfos.filter(device => device.kind === 'videoinput' && device.label.indexOf('USB 2.0 Camera') !== -1)[0];
    let audioDeviceId = audioDevice && audioDevice.deviceId;
    let videoDeviceId = videoDevice && videoDevice.deviceId;
    console.log('DEVICE IDS', {audioDeviceId, videoDeviceId});
    $('#localVideo').hide();
    let stream = await navigator.mediaDevices.getUserMedia({
      audio: {deviceId: audioDeviceId ? {exact: audioDeviceId} : undefined},
      video: {deviceId: videoDeviceId ? {exact: videoDeviceId} : undefined}
    });
    var video = document.getElementById('localVideo')
    video.srcObject = stream
    video.play()

    stream.getTracks().forEach(function(track) {
      pc1.addTrack(track, stream);
    });
    console.log(stream)
    console.log('adding stream to pc1')
    pc1.createOffer(function (desc) {
      pc1.setLocalDescription(desc, function () { }, function () { })
      console.log('created local offer', desc)
    },
      function () { console.warn("Couldn't create offer") },
      sdpConstraints)
  } catch (error) {
    console.log('Error adding stream to pc1: ' + error)
  }
}

async function onIceCandidate(e) {
  console.log('ICE candidate (pc1)', e)
  if (e.candidate == null) {
    await fetch(`${SIGNALMASTER}/offer/smallthing`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(pc1.localDescription)
    });
    setTimeout(waitForAnswer, 1000);
    // $('#localOffer').html(JSON.stringify(pc1.localDescription))
  }
}

async function waitForAnswer() {
  try {
    let answer = await fetch(`${SIGNALMASTER}/answer/smallthing`).then(r => r.json());
    console.log('Answer:', answer);
    var answerDesc = new RTCSessionDescription(answer);
    handleAnswerFromPC2(answerDesc)
  } catch (e) {
    console.log('Waiting for answer...');
    setTimeout(waitForAnswer, 1000);
  }
}

function onTrack(e){
  console.log('ON TRACK', e);
  let {track} = e;
  if(track.kind === 'video') {
    console.log('Got remote video stream', track, e)
    let el = document.getElementById('remoteVideo')
    let stream = e.streams[0];
    if(stream){
      el.srcObject = e.streams[0];
      el.play();
      stream.onremovetrack = event => {
        console.log('onremovetrack (video)', event);
      }
    }

  } else if (track.kind === 'audio') {
    console.log('Got remote audio stream', track)
    let el = document.getElementById('remoteAudio')
    let stream = e.streams[0]
    if(stream){
      el.srcObject = e.streams[0];
      el.play();
      stream.onremovetrack = event => {
        console.log('onremovetrack (audio)', event);
      }
    }

  }
}

// pc1.ontrack = onTrack;

function onsignalingstatechange(state) {
  console.info('signaling state change:', state)
}

function oniceconnectionstatechange(state) {
  console.info('ice connection state change:', state);
  console.log('new state:', pc1.iceConnectionState);
  if(pc1.iceConnectionState === 'disconnected'){
    createLocalOffer();
  }
}

function onicegatheringstatechange(state) {
  console.info('ice gathering state change:', state)
}

// pc1.onsignalingstatechange = onsignalingstatechange
// pc1.oniceconnectionstatechange = oniceconnectionstatechange
// pc1.onicegatheringstatechange = onicegatheringstatechange

function handleAnswerFromPC2(answerDesc) {
  console.log('Received remote answer: ', answerDesc)
  pc1.setRemoteDescription(answerDesc)
}

function handleCandidateFromPC2(iceCandidate) {
  pc1.addIceCandidate(iceCandidate)
}

// pc1.onaddstream = function () {
//   console.log('WTF!!!!!!!!');
// }
