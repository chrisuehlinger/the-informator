#!/bin/bash -x

echo $1
echo $2
ffmpeg -f avfoundation -framerate 30 -r 30 -video_size 1280x960 -i "USB" -t 10 -sws_flags lanczos+full_chroma_inp public/footage/unapproved/${1}.mpg
ffmpeg -i public/footage/unapproved/${1}.mpg  -vf scale=-1:360 public/footage/unapproved/${1}.mp4
rm public/footage/unapproved/${1}.mpg
