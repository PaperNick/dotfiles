#!/bin/sh

# Note: make sure to enable AppArmor to read this script:
# https://github.com/jonls/redshift/issues/850#issuecomment-1430106510
#
# Location of AppArmor file: /etc/apparmor.d/usr.bin.redshift
# Add the following between the braces:
#  owner @{HOME}/.config/redshift.conf r,
#  owner @{HOME}/.config/redshift/** r,
#  owner @{HOME}/.config/redshift/hooks/** ux,
#
# Related issues:
# https://github.com/jonls/redshift/pull/149
# https://github.com/jonls/redshift/issues/858#issuecomment-1125324576
# https://github.com/jonls/redshift/issues/838


# Debug input params of this script:
# echo "Redshift params: \n $@" >> ~/Desktop/redshift-debug-params.txt

set_light_theme() {
    xfconf-query -c xsettings -p /Net/ThemeName -s Greybird
    xfconf-query -c xfwm4 -p /general/theme -s Greybird
    xfconf-query -c xfce4-panel -p /panels/dark-mode -s false
}

set_night_theme() {
    xfconf-query -c xsettings -p /Net/ThemeName -s Greybird-dark
    xfconf-query -c xfwm4 -p /general/theme -s Greybird-dark
    xfconf-query -c xfce4-panel -p /panels/dark-mode -s true
}

if [ "$1" = "period-changed" ]; then
    case "$3" in
        night)
            set_night_theme
            ;;
        transition)
            current_month="$(date '+%-m')"
            if [ "$current_month" -ge 4 ] && [ "$current_month" -le 10 ]; then
                # Activate the night theme earlier during Summer time
                set_night_theme
            fi
            ;;
        daytime)
            set_light_theme
            ;;
    esac
fi
