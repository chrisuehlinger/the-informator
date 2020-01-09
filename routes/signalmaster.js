const express = require('express');
const router = express.Router();

const rtcSignals = require('../util/rtc-signals');

router.get('/offer/:app', function(req, res) {
  if(rtcSignals.offer[req.params.app]) {
    res.json(rtcSignals.offer[req.params.app]);
    rtcSignals.offer[req.params.app] = null;
  } else {
    res.sendStatus(404);
  }
});

router.post('/offer/:app', function(req, res) {
  rtcSignals.offer[req.params.app] = req.body;
  res.sendStatus(200);
});

router.get('/answer/:app', function(req, res) {
  if(rtcSignals.answer[req.params.app]) {
    res.json(rtcSignals.answer[req.params.app]);
    rtcSignals.answer[req.params.app] = null;
  } else {
    res.sendStatus(404);
  }
});

router.post('/answer/:app', function(req, res) {
  rtcSignals.answer[req.params.app] = req.body;
  res.sendStatus(200);
});

module.exports = router;
