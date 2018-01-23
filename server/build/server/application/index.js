'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _index = require('../lib/application/index.js');

var _index2 = _interopRequireDefault(_index);

var _config = require('../config.js');

var _config2 = _interopRequireDefault(_config);

var _2 = require('../lib/_.js');

var _3 = _interopRequireDefault(_2);

var _urlParse = require('url-parse');

var _urlParse2 = _interopRequireDefault(_urlParse);

var _cache = require('../lib/cache.js');

var _cache2 = _interopRequireDefault(_cache);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// import fs from 'fs';

var Application = function (_BaseApplication) {
    _inherits(Application, _BaseApplication);

    function Application() {
        _classCallCheck(this, Application);

        return _possibleConstructorReturn(this, (Application.__proto__ || Object.getPrototypeOf(Application)).call(this, _config2.default));
    }

    _createClass(Application, [{
        key: 'getRouteMap',
        value: function getRouteMap() {
            return [{
                path: '/cache',
                handler: this.readCache
            }];
        }
    }, {
        key: 'readCache',
        value: function readCache(req, res) {
            var headers = req.headers;
            var crawledUrl = headers['x-crawled-url'];

            // console.dir(`To crawl: ${crawledUrl}`);

            res.asHTML();

            if (!_3.default.isStringNotEmpty(crawledUrl)) {
                res.s400().send('No crawled URL specified').end();
                return;
            }

            if (!_3.default.isArrayNotEmpty(_config2.default.targets) || !_3.default.isStringNotEmpty(_config2.default.cacheFolder)) {
                res.s500().end();
                return;
            }

            var cUrl = new _urlParse2.default(crawledUrl);
            var base = '' + cUrl.protocol + (cUrl.slashes ? '//' : '/') + cUrl.host;

            var target = _config2.default.targets.find(function (address) {
                return address.trim() === base;
            });

            if (!_3.default.isStringNotEmpty(target)) {
                res.s400().send('Who are you and what do you want?').end();
                return;
            }

            var path = _cache2.default.makeLocationFilePath(_config2.default.cacheFolder, target, '' + target + cUrl.pathname);
            // console.dir(`Path: ${path}`);

            res.streamFile(path);
        }
    }]);

    return Application;
}(_index2.default);

exports.default = Application;