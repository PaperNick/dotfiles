"use strict";
var state = "off";
var options = {
    shuffle_action: "play_current",
    key_toggle: "ctrl+shift+s",
};
function shuffleOn() {
    mp.command("playlist-shuffle");
    if (options.shuffle_action === "play_first") {
        mp.commandv("set", "playlist-pos", "0");
    }
}
function shuffleOff() {
    mp.command("playlist-unshuffle");
}
var stateMachine = {
    off: { action: shuffleOn, next: "on" },
    on: { action: shuffleOff, next: "off" },
};
function toggleShuffle() {
    var current = stateMachine[state];
    current.action();
    state = current.next;
    var currentPos = mp.get_property_number("playlist-pos");
    var totalCount = mp.get_property_number("playlist-count");
    mp.osd_message("Shuffle ".concat(state, " (").concat(currentPos + 1, "/").concat(totalCount, ")"), 5);
}
mp.options.read_options(options, "toggle-playlist-shuffle");
mp.add_key_binding(options.key_toggle, "toggle-playlist-shuffle", toggleShuffle);
