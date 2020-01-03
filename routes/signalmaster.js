const express = require('express');
const router = express.Router();

let offer = null;
let answer = null;

router.get('/offer', function(req, res) {
  if(offer) {
    res.json(offer);
    offer = null;
  } else {
    res.sendStatus(404);
  }
});

router.post('/offer', function(req, res) {
  offer = req.body;
  res.sendStatus(200);
});

router.get('/answer', function(req, res) {
  if(answer) {
    res.json(answer);
    answer = null;
  } else {
    res.sendStatus(404);
  }
});

router.post('/answer', function(req, res) {
  answer = req.body;
  res.sendStatus(200);
});

module.exports = router;
