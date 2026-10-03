#!/bin/bash
mkdir -p frames
ffmpeg -i video/Coffee_make.mp4 -vf "fps=15,scale=1920:-1" -c:v libwebp -quality 80 "frames/frame_%04d.webp"
echo "Done! Open index.html in your browser."