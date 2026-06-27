"use strict";
var options = {
    lrc_tools_binary: "lrc_tools",
};
function logError(message) {
    mp.msg.error(message);
    if (mp.get_property_native("vo-configured")) {
        mp.osd_message(message, 5);
    }
}
function isWindows() {
    var workdir = mp.get_property_native("working-directory");
    return workdir.indexOf("\\") !== -1;
}
function getBasename(path) {
    var _a;
    var pathSeparator = isWindows() ? "\\" : "/";
    return (_a = path.split(pathSeparator).pop()) !== null && _a !== void 0 ? _a : path;
}
function isLrcToolsInstalled() {
    var _a;
    var lrcTools = options.lrc_tools_binary;
    var whichCmd = isWindows() ? "where" : "which";
    var subprocessResult = mp.command_native({
        name: "subprocess",
        capture_stdout: true,
        capture_stderr: true,
        args: [whichCmd, lrcTools],
    });
    if (subprocessResult.killed_by_us) {
        return false;
    }
    if (subprocessResult.status < 0) {
        logError("Could not check '".concat(getBasename(lrcTools), "': ").concat((_a = subprocessResult.error_string) !== null && _a !== void 0 ? _a : "unknown error"));
        return false;
    }
    return subprocessResult.status === 0;
}
function readLyrics(filePath, type) {
    var _a, _b;
    if (type === void 0) { type = "timed"; }
    var lrcTools = options.lrc_tools_binary;
    var subprocessResult = mp.command_native({
        name: "subprocess",
        capture_stdout: true,
        capture_stderr: true,
        args: [lrcTools, "read", "--include-lang", filePath, type],
    });
    if (subprocessResult.killed_by_us) {
        return null;
    }
    if (subprocessResult.status < 0) {
        logError("Subprocess error: ".concat((_a = subprocessResult.error_string) !== null && _a !== void 0 ? _a : "unknown error"));
        return null;
    }
    if (subprocessResult.status !== 0) {
        var errorOutput = ((_b = subprocessResult.stderr) !== null && _b !== void 0 ? _b : "").trim();
        var noLyricsPattern = new RegExp("No ".concat(type, " lyrics"), "i");
        var noLyricsMatch = noLyricsPattern.test(errorOutput);
        var hasNonStandardError = !noLyricsMatch;
        if (hasNonStandardError) {
            logError("'".concat(getBasename(lrcTools), "' error: ").concat(errorOutput));
        }
        return null;
    }
    var rawLyrics = subprocessResult.stdout;
    return rawLyrics !== null && rawLyrics !== void 0 ? rawLyrics : null;
}
function parseTimedLyricsAndLang(rawOutput) {
    var _a, _b;
    var language = null;
    var lrcLines = [];
    for (var _i = 0, _c = rawOutput.split("\n"); _i < _c.length; _i++) {
        var line = _c[_i];
        var cleanedLine = line.replace(/\r$/, "");
        if (!language) {
            language = (_b = (_a = cleanedLine.match(/^Language:\s*(\w+)/)) === null || _a === void 0 ? void 0 : _a[1]) !== null && _b !== void 0 ? _b : null;
        }
        // Keep only timestamp lines like [mm:ss.xx], skip metadata tags like [ar:Artist]
        if (/^\[\d+:\d+/.test(cleanedLine)) {
            lrcLines.push(cleanedLine);
        }
    }
    return { language: language, lyrics: lrcLines.join("\n") };
}
function getFileExtension(filePath) {
    var lastDotIndex = filePath.lastIndexOf(".");
    return lastDotIndex !== -1 ? filePath.slice(lastDotIndex).toLowerCase() : "";
}
function isLocalFile(filePath) {
    return filePath.indexOf("://") === -1;
}
function loadLyricsInMpv(lyrics, language) {
    var subtitleArguments = ["sub-add", "memory://".concat(lyrics), "select", "Embedded LRC"];
    if (language) {
        subtitleArguments.push(language);
    }
    mp.commandv.apply(mp, subtitleArguments);
}
function main() {
    mp.options.read_options(options, "mpv-lrc-loader");
    mp.register_event("file-loaded", function () {
        var _a;
        var filePath = mp.get_property("path");
        if (!filePath) {
            return;
        }
        if (!isLocalFile(filePath)) {
            return;
        }
        if (getFileExtension(filePath) !== ".mp3") {
            return;
        }
        if (!isLrcToolsInstalled()) {
            logError("'".concat(getBasename(options.lrc_tools_binary), "' is not installed. Please install it from https://github.com/PaperNick/lrc_tools"));
            return;
        }
        var rawOutput = (_a = readLyrics(filePath, "timed")) !== null && _a !== void 0 ? _a : readLyrics(filePath, "plain");
        if (!rawOutput) {
            return;
        }
        var _b = parseTimedLyricsAndLang(rawOutput), language = _b.language, lyrics = _b.lyrics;
        if (!lyrics) {
            return;
        }
        loadLyricsInMpv(lyrics, language);
    });
}
main();
