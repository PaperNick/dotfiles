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
