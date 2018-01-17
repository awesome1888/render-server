'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _md = require('md5');

var _md2 = _interopRequireDefault(_md);

var _fshelper = require('./fshelper.js');

var _fshelper2 = _interopRequireDefault(_fshelper);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Cache {
    static makeLocationFilePath(cacheFolder, baseUrl, location) {
        return `${this.makeLocationSubFolderPath(cacheFolder, baseUrl, location)}${(0, _md2.default)(location)}`;
    }

    static makeLocationSubFolderPath(cacheFolder, baseUrl, location) {
        location = _fshelper2.default.secureName(location);

        return `${this.makeBaseUrlFolderPath(cacheFolder, baseUrl)}${(0, _md2.default)(location).substr(0, 3)}/`;
    }

    static makeBaseUrlFolderPath(cacheFolder, baseUrl) {
        return `${cacheFolder}${(0, _md2.default)(baseUrl)}/`;
    }
}
exports.default = Cache;