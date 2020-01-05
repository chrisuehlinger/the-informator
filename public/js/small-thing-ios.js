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

setTimeout(startup);

async function startup() {
  try {
    pc2 = new RTCPeerConnection(cfg, con);
    pc2.onicecandidate = onicecandidate;
    pc2.onsignalingstatechange = onsignalingstatechange
    pc2.oniceconnectionstatechange = oniceconnectionstatechange
    pc2.onicegatheringstatechange = onicegatheringstatechange
    pc2.ontrack = onTrack;

    let constraints = {
      video: {
        height: 480,
        width: 640
      },
      audio: true
    };

    if(iOS){
      constraints.video.facingMode = { exact: "environment" };
    }

    let stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log(stream);
      console.log(stream.getVideoTracks());
      console.log(stream.getVideoTracks()[0].getCapabilities());
    var video = document.getElementById('localVideo')
    video.srcObject = stream
    video.play()
    stream.getTracks().forEach(function(track) {
      pc2.addTrack(track, stream);
    });
    setTimeout(waitForOffer, 1000);
  } catch (error) {
    console.log('Error adding stream to pc2: ' + error)
  }
}

/* THIS IS BOB, THE ANSWERER/RECEIVER */

var pc2 = new RTCPeerConnection(cfg, con),
  dc2 = null

var pc2icedone = false

let gotOffer = false;
async function waitForOffer() {
  try {
    let offer = await fetch(`${SIGNALMASTER}/offer`).then(r => r.json());
    var offerDesc = new RTCSessionDescription(offer)
    console.log('Received remote offer', offerDesc)
    handleOfferFromPC1(offerDesc)
    gotOffer = true;
  } catch (e) {
    console.log('Waiting for offer...');
    setTimeout(waitForOffer, 100);
  }
}

async function handleOfferFromPC1(offerDesc) {
  pc2.setRemoteDescription(offerDesc)
  try {
  let answerDesc = await pc2.createAnswer(sdpConstraints)
    console.log('Created local answer: ', answerDesc);
    pc2.setLocalDescription(answerDesc);
  } catch(e) {
    console.warn("Couldn't create offer");
  }
}


async function onicecandidate(e) {
  console.log('ICE candidate (pc2)', e)
  if (e.candidate == null) {
    await fetch(`${SIGNALMASTER}/answer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(pc2.localDescription)
    });
    // $('#localAnswer').html(JSON.stringify(pc2.localDescription))
  }
}

function onsignalingstatechange(state) {
  console.info('signaling state change:', state)
}

function oniceconnectionstatechange(state) {
  console.info('ice connection state change:', state)
  console.log('new state:', pc2.iceConnectionState);
  if(pc2.iceConnectionState === 'disconnected'){
    startup();
  }
}

function onicegatheringstatechange(state) {
  console.info('ice gathering state change:', state)
}

// pc2.onsignalingstatechange = onsignalingstatechange
// pc2.oniceconnectionstatechange = oniceconnectionstatechange
// pc2.onicegatheringstatechange = onicegatheringstatechange

function onTrack(e){
  console.log('ON TRACK', e);
  let {track} = e;
  if(track.kind === 'video') {
    console.log('Got remote video stream', track)
    let el = document.getElementById('remoteVideo')
    el.srcObject = e.streams[0];
    el.play();
  } else if (track.kind === 'audio') {
    console.log('Got remote audio stream', track)
    let el = document.getElementById('remoteAudio')
    el.srcObject = e.streams[0];
    el.play();

  }
}

// pc2.ontrack = onTrack;

function changeVideoCodec(mimeType) {
  const transceivers = pc2.getTransceivers();

  transceivers.forEach(transceiver => {
    const kind = transceiver.sender.track.kind;
    let sendCodecs = RTCRtpSender.getCapabilities(kind).codecs;
    let recvCodecs = RTCRtpReceiver.getCapabilities(kind).codecs;

    if (kind === "video") {
      sendCodecs = preferCodec(mimeType);
      recvCodecs = preferCodec(mimeType);
      transceiver.setCodecPreferences([...sendCodecs, ...recvCodecs]);
    }
  });

  pc2.onnegotiationneeded();
}
