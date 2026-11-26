#!/usr/bin/env bash
# Render + mux the 5 EP003 Shorts: Short-EP003-N (muted video) + out/shorts/<id>.wav -> out/shorts/<id>.mp4
set -e
export CRIMSON_BROWSER=${CRIMSON_BROWSER:-/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell}
ids=(s0-teaser s1-boxes s2-fired s3-spy s4-ban)
for n in 0 1 2 3 4; do
  id=${ids[$n]}
  npx remotion render src/index.ts Short-EP003-$n out/shorts/$id-silent.mp4 --muted --crf=20 --log=error
  ffmpeg -v error -y -i out/shorts/$id-silent.mp4 -i out/shorts/$id.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest out/shorts/$id.mp4
  echo "DONE $id"
done
echo SHORTS_DONE
