#!/bin/bash

ffmpeg -f concat -safe 0 -i stageleft-census.txt -c copy public/footage/approved/stageleft.mp4
ffmpeg -f concat -safe 0 -i stageright-census.txt -c copy public/footage/approved/stageright.mp4
