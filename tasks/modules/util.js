///<reference path="../../typings/node.d.ts" />
var _path = require("path"), _fs = require("fs"), _os = require("os");
/**
 * string 型かどうか
 */
function isStr(val) {
    return Object.prototype.toString.call(val) === "[object String]";
}
exports.isStr = isStr;
/**
 * boolean 型かどうか
 */
function isBool(val) {
    return Object.prototype.toString.call(val) === "[object Boolean]";
}
exports.isBool = isBool;
/**
 * 配列かどうか
 */
function isArray(val) {
    return Object.prototype.toString.call(val) === "[object Array]";
}
exports.isArray = isArray;
/**
 * undefined かどうか
 */
function isUndef(val) {
    return typeof val === "undefined";
}
exports.isUndef = isUndef;
/**
 * bin ディレクトリのパス
 */
function getBinDir() {
    return _path.dirname(require.resolve("typescript"));
}
exports.getBinDir = getBinDir;
//ts
var hasOwnProperty = Object.prototype.hasOwnProperty;
function hasProperty(value, key) {
    return hasOwnProperty.call(value, key);
}
exports.hasProperty = hasProperty;
var colonCode = 0x3A;
var slashCode = 0x2F;
function getRootLength(path) {
    if (path.charCodeAt(0) === slashCode) {
        if (path.charCodeAt(1) !== slashCode)
            return 1;
        var p1 = path.indexOf("/", 2);
        if (p1 < 0)
            return 2;
        var p2 = path.indexOf("/", p1 + 1);
        if (p2 < 0)
            return p1 + 1;
        return p2 + 1;
    }
    if (path.charCodeAt(1) === colonCode) {
        if (path.charCodeAt(2) === slashCode)
            return 3;
        return 2;
    }
    var idx = path.indexOf("://");
    if (idx !== -1)
        return idx + 3;
    return 0;
}
exports.getRootLength = getRootLength;
/**
 * パスの区切り文字を静音化(バックスラッシュをスラッシュに)
 */
function normalizeSlashes(path) {
    return path.replace(/\\/g, "/");
}
exports.normalizeSlashes = normalizeSlashes;
var directorySeparator = "/";
function getNormalizedParts(normalizedSlashedPath, rootLength) {
    var parts = normalizedSlashedPath.substr(rootLength).split(directorySeparator);
    var normalized = [];
    for (var _i = 0; _i < parts.length; _i++) {
        var part = parts[_i];
        if (part !== ".") {
            if (part === ".." && normalized.length > 0 && normalized[normalized.length - 1] !== "..") {
                normalized.pop();
            }
            else {
                if (part) {
                    normalized.push(part);
                }
            }
        }
    }
    return normalized;
}
function normalizePath(path) {
    var spath = normalizeSlashes(path);
    var rootLength = getRootLength(spath);
    var normalized = getNormalizedParts(spath, rootLength);
    return spath.substr(0, rootLength) + normalized.join(directorySeparator);
}
exports.normalizePath = normalizePath;
function combinePaths(path1, path2) {
    if (!(path1 && path1.length))
        return path2;
    if (!(path2 && path2.length))
        return path1;
    //if (path2.charAt(0) === directorySeparator) return path2;
    if (getRootLength(path2) !== 0)
        return path2;
    if (path1.charAt(path1.length - 1) === directorySeparator)
        return path1 + path2;
    return path1 + directorySeparator + path2;
}
exports.combinePaths = combinePaths;
function getDirectoryPath(path) {
    return path.substr(0, Math.max(getRootLength(path), path.lastIndexOf(directorySeparator)));
}
exports.getDirectoryPath = getDirectoryPath;
function readFile(fileName, encoding) {
    if (!_fs.existsSync(fileName)) {
        return undefined;
    }
    var buffer = _fs.readFileSync(fileName);
    var len = buffer.length;
    if (len >= 2 && buffer[0] === 0xFE && buffer[1] === 0xFF) {
        // Big endian UTF-16 byte order mark detected. Since big endian is not supported by node.js,
        // flip all byte pairs and treat as little endian.
        len &= ~1;
        for (var i = 0; i < len; i += 2) {
            var temp = buffer[i];
            buffer[i] = buffer[i + 1];
            buffer[i + 1] = temp;
        }
        return buffer.toString("utf16le", 2);
    }
    if (len >= 2 && buffer[0] === 0xFF && buffer[1] === 0xFE) {
        // Little endian UTF-16 byte order mark detected
        return buffer.toString("utf16le", 2);
    }
    if (len >= 3 && buffer[0] === 0xEF && buffer[1] === 0xBB && buffer[2] === 0xBF) {
        // UTF-8 byte order mark detected
        return buffer.toString("utf8", 3);
    }
    // Default is UTF-8 with no byte order mark
    return buffer.toString("utf8");
}
exports.readFile = readFile;
function writeFile(fileName, data, writeByteOrderMark) {
    // If a BOM is required, emit one
    if (writeByteOrderMark) {
        data = '\uFEFF' + data;
    }
    _fs.writeFileSync(fileName, data, "utf8");
}
exports.writeFile = writeFile;
function abs(fileName) {
    return normalizePath(_path.resolve(".", normalizePath(fileName)));
}
exports.abs = abs;
function directoryExists(path) {
    return _fs.existsSync(path) && _fs.statSync(path).isDirectory();
}
exports.directoryExists = directoryExists;
function dirOrFileExists(path) {
    return _fs.existsSync(path);
}
exports.dirOrFileExists = dirOrFileExists;
function createDirectory(directoryName) {
    if (!directoryExists(directoryName)) {
        _fs.mkdirSync(directoryName);
    }
}
exports.createDirectory = createDirectory;
function createDirectoryRecurse(directoryName) {
    if (directoryName.length > getRootLength(directoryName) && !directoryExists(directoryName)) {
        var parentDirectory = getDirectoryPath(directoryName);
        createDirectoryRecurse(parentDirectory);
        //TODO:
        createDirectory(directoryName);
    }
}
exports.createDirectoryRecurse = createDirectoryRecurse;
function getCurrentDirectory() {
    return normalizePath(_path.resolve("."));
}
exports.getCurrentDirectory = getCurrentDirectory;
function relativePath(from, to) {
    return _path.relative(from, to);
}
exports.relativePath = relativePath;
function write(str) {
    console.log(str);
}
exports.write = write;
function writeAbort(str) {
    console.log((str || "").red);
}
exports.writeAbort = writeAbort;
function writeError(str) {
    console.log(">> ".red + str.trim().replace(/\n/g, "\n>> ".red));
}
exports.writeError = writeError;
function writeInfo(str) {
    console.log(">> ".cyan + str.trim().replace(/\n/g, "\n>> ".cyan));
}
exports.writeInfo = writeInfo;
function writeWarn(str) {
    console.log(">> ".yellow + str.trim().replace(/\n/g, "\n>> ".yellow));
}
exports.writeWarn = writeWarn;
