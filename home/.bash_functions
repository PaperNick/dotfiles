#!/bin/bash

mullvad_random_location() {
  # Filter out US, Canada, Hong Kong VPNs
  local vpn_list="$(mullvad relay list | grep -E '*\.*\.*\.*\) \-' | grep -v 'us-' | grep -v 'ca-' | grep -v 'hk-hkg-' | awk '{print $1}')"
  local rand_location="$(echo "$vpn_list" | shuf -n 1)"
  local country="$(echo "$rand_location" | cut -d '-' -f1)"
  local city="$(echo "$rand_location" | cut -d '-' -f2)"
  mullvad relay set location "$country" "$city" "$rand_location"
}

add_mp3_cover() {
  ffmpeg -i "$1" -i "$2" -map 0:0 -map 1:0 -c copy -id3v2_version 3 -metadata:s:v title="Album cover" -metadata:s:v comment="Cover (front)" "${1%.*} (cover).mp3"
}

qrdisplay() {
  if [ "$(command -v qrencode)" = "" ]; then
    echo "Error: qrencode package is not installed. Aborting."
    return 1
  fi

  local text_to_encode="$1"
  if [ "$text_to_encode" = "" ]; then
    echo "Error: Please provide text to encode as a first param."
    return 1
  fi

  # Pipe output directly into the image viewer (works only with loupe):
  # loupe <(qrencode -s 32 "$text_to_encode" -o -)
  local qr_image_path="/tmp/qr_$(date +"%Y-%m-%d-%H-%M-%S").png"
  qrencode -s 32 "$text_to_encode" -o "$qr_image_path"

  local image_viewer_executable="$(command -v loupe || command -v eog || command -v ristretto)"
  if [ "$image_viewer_executable" = "" ]; then
    echo "Error: Could not find an image viewer (tried with loupe, eog, ristretto)"
    echo "QR code image path: $qr_image_path"
    return 1
  fi

  "$image_viewer_executable" "$qr_image_path"

  # Cleanup after the viewer is closed
  rm "$qr_image_path"
}
