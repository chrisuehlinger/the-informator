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

setTimeout(async function createLocalOffer() {
  console.log('video1')

  try {
    $('#localVideo').hide();
    let stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
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
});

pc1.onicecandidate = async function (e) {
  console.log('ICE candidate (pc1)', e)
  if (e.candidate == null) {
    await fetch(`${SIGNALMASTER}/offer`, {
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
    let answer = await fetch(`${SIGNALMASTER}/answer`).then(r => r.json());
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
    el.srcObject = e.streams[0];
    el.play();
    setTimeout(function yessss() {
      seriously = new Seriously();
      source = seriously.source('#remoteVideo');
      if (source.width === 1 && source.height === 1) {
        return setTimeout(yessss, 100);
      }
      target = seriously.target('#target');
      fisheye = seriously.effect('fisheye');
      fisheye.aperture = 360;
      target.source = source;
      console.log('aspect', source.width, source.height, source)
      var aspect = source.height / source.width;
      target.width = Math.min(window.innerWidth, source.width);
      target.height = target.width * aspect;
      console.log('HMM', target.width, target.height, aspect)
      fisheye.source = source;
      seriously.go();
      $('#target').show();
    }, 100);
  } else if (track.kind === 'audio') {
    console.log('Got remote audio stream', track)
    let el = document.getElementById('remoteAudio')
    el.srcObject = e.streams[0];
    el.play();

  }
}

pc1.ontrack = onTrack;

function onsignalingstatechange(state) {
  console.info('signaling state change:', state)
}

function oniceconnectionstatechange(state) {
  console.info('ice connection state change:', state)
}

function onicegatheringstatechange(state) {
  console.info('ice gathering state change:', state)
}

pc1.onsignalingstatechange = onsignalingstatechange
pc1.oniceconnectionstatechange = oniceconnectionstatechange
pc1.onicegatheringstatechange = onicegatheringstatechange

function handleAnswerFromPC2(answerDesc) {
  console.log('Received remote answer: ', answerDesc)
  pc1.setRemoteDescription(answerDesc)
}

function handleCandidateFromPC2(iceCandidate) {
  pc1.addIceCandidate(iceCandidate)
}

pc1.onaddstream = function () {
  console.log('WTF!!!!!!!!');
}
