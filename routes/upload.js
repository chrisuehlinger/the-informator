const path = require('path');
const fs = require('fs').promises;
const { init, render } = require('@nexrender/core');

const express = require('express');
const router = express.Router();

let settings = {
  multiFrames: true,
  // addLicense: false
};
settings = init(Object.assign(settings, {
  logger: console
}));

router.post('/', async function(req, res) {
  try {
    let startTime = Date.now();
    console.log(req.headers);
    let inputFilePath = path.join(__dirname, `../footage/input.mp4`);
    await fs.writeFile(inputFilePath, req.body);
    let uploadFinishTime = Date.now()
    res.send('File uploaded!');

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
            params: {"-vcodec": "h264_videotoolbox"}
          },
          {
              module: "@nexrender/action-copy",
              input: "output.mp4",
              output: path.join(__dirname,'../footage/output.mp4')
          }
        ]
      }
    }

    let finishedJob = await render(job, settings)
    let renderFinishTime = Date.now();

    let uploadTime = (uploadFinishTime - startTime)/1000;
    let renderTime = (renderFinishTime - uploadFinishTime) / 1000;

    console.log('RENDER COMPLETE');
    console.log(`UPLOAD TIME: ${uploadTime}s`);
    console.log(`RENDER TIME: ${renderTime}s`);
    console.log(`TOTAL TIME: ${uploadTime+renderTime}s`);
  } catch(e){
    console.error('OHNO', e);
  }
});

module.exports = router;
