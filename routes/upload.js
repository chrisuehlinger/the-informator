const uuid = require('uuid/v4');
const path = require('path');
const fs = require('fs').promises;
const { init, render } = require('@nexrender/core');

const express = require('express');
const router = express.Router();

const { sendControlMessage } = require('../sockets');

let settings = {
  multiFrames: true,
  // addLicense: false
};
settings = init(Object.assign(settings, {
  logger: console
}));

let unapprovedFolder = path.join(__dirname, `../public/footage/unapproved`);
let approvedFolder = path.join(__dirname, `../public/footage/approved`);
router.post('/', async function(req, res) {
  try {
    let startTime = Date.now();
    console.log(req.headers);
    console.log(req.headers['filename']);
    let inputFilePath = path.join(__dirname, `../public/footage/unapproved/${req.headers['filename']}.mp4`);
    await fs.mkdir(unapprovedFolder, { recursive: true })
    await fs.writeFile(inputFilePath, req.body);
    let uploadFinishTime = Date.now()
    res.send('File uploaded!');

    let uploadTime = (uploadFinishTime - startTime)/1000;
    console.log(`UPLOAD TIME: ${uploadTime}s`);
    sendControlMessage({
      messageType:'newVideo',
      video: {
        name: req.headers['filename'],
        path: `footage/unapproved/${req.headers['filename']}.mp4`,
        uuid: uuid()
      }
    })
  } catch(e){
    console.error('OHNO', e);
  }
});

router.get('/render/:name', async function(req, res) {
  try {

    let startTime = Date.now();
    let inputFilePath = path.join(__dirname, `../public/footage/unapproved/${req.params.name}.mp4`);

    res.send('Render request received!');
    let job = {
      template: {
        src: `file://${path.join(__dirname,'..')}/render-o-matic.aep`,
        composition: "test"
      },
      assets: [
        {
          src: `file://${inputFilePath}`,
          type: "video",
          layerName: "input.mp4"
        }
      ],
      actions: {
        postrender: [
          {
            module: "@nexrender/action-encode",
            preset: "mp4",
            output: "output.mp4",
            // params: {"-vcodec": "h264_videotoolbox"}
          },
          {
              module: "@nexrender/action-copy",
              input: "output.mp4",
              output: path.join(__dirname,`../public/footage/approved/${req.params.name}.mp4`)
          }
        ]
      }
    }


    await fs.mkdir(approvedFolder, { recursive: true })
    let finishedJob = await render(job, settings)
    await fs.unlink(inputFilePath);
    let renderFinishTime = Date.now();

    let renderTime = (renderFinishTime - startTime) / 1000;

    console.log('RENDER COMPLETE');
    console.log(`RENDER TIME: ${renderTime}s`);
  } catch(e){
    console.error('OHNO', e);
  }
});

module.exports = router;
