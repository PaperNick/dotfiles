mullvad_random_location() {
    # Filter out US, Canada, Hong Kong VPNs
    local vpn_list="$(mullvad relay list | grep -E '*\.*\.*\.*\) \-' | grep -v 'us-' | grep -v 'ca-' | grep -v 'hk-hkg-' | awk '{print $1}')"
    local rand_location="$(echo "$vpn_list" | shuf -n 1)"
    local country="$(echo "$rand_location" | cut -d '-' -f1)"
    local city="$(echo "$rand_location" | cut -d '-' -f2)"
    mullvad relay set location "$country" "$city" "$rand_location"
}
