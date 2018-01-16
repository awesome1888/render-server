'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _md = require('md5');

var _md2 = _interopRequireDefault(_md);

var _fshelper = require('./fshelper.js');

var _fshelper2 = _interopRequireDefault(_fshelper);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Cache = function () {
    function Cache() {
        _classCallCheck(this, Cache);
    }

    _createClass(Cache, null, [{
        key: 'makeLocationFilePath',
        value: function makeLocationFilePath(cacheFolder, baseUrl, location) {
            return '' + this.makeLocationSubFolderPath(cacheFolder, baseUrl, location) + (0, _md2.default)(location);
        }
    }, {
        key: 'makeLocationSubFolderPath',
        value: function makeLocationSubFolderPath(cacheFolder, baseUrl, location) {
            location = _fshelper2.default.secureName(location);

            return '' + this.makeBaseUrlFolderPath(cacheFolder, baseUrl) + (0, _md2.default)(location).substr(0, 3) + '/';
        }
    }, {
        key: 'makeBaseUrlFolderPath',
        value: function makeBaseUrlFolderPath(cacheFolder, baseUrl) {
            return '' + cacheFolder + (0, _md2.default)(baseUrl) + '/';
        }
    }]);

    return Cache;
}();

exports.default = Cache;