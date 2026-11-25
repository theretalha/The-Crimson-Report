#!/usr/bin/env bash
# Full EP 003 rebuild: cues -> mix -> master (-14 LUFS) -> render muted -> mux. Run from studio/.
set -e
export CRIMSON_BROWSER=${CRIMSON_BROWSER:-/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell}
npx tsx tools/export-cues.ts out/ep003-cues.json
python3 tools/mix_audio.py --voice public/audio/ep003.wav --cues out/ep003-cues.json --timing src/data/ep003-timing.json --out out/ep003-mix.wav
M=$(ffmpeg -hide_banner -i out/ep003-mix.wav -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
g() { echo "$M" | python3 -c "import sys,json;print(json.load(sys.stdin)['$1'])"; }
ffmpeg -v error -y -i out/ep003-mix.wav -af "loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=$(g input_i):measured_TP=$(g input_tp):measured_LRA=$(g input_lra):measured_thresh=$(g input_thresh):offset=$(g target_offset):linear=true" -ar 48000 out/ep003-master.wav
cp out/ep003-mix.wav public/audio/ep003-mix.wav
npx remotion render src/index.ts EP003-Nvidia out/EP003-v3-silent.mp4 --muted --crf=20
ffmpeg -v error -y -i out/EP003-v3-silent.mp4 -i out/ep003-master.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest out/EP003-Nvidia-Spy-Scandal.mp4
echo REBUILD_DONE
