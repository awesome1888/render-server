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
                handler: this.processUrl
            }];
        }
    }, {
        key: 'processUrl',
        value: function processUrl(req, res) {
            var headers = req.headers;
            var crawledUrl = headers['x-crawled-url'];

            if (!_3.default.isStringNotEmpty(crawledUrl)) {
                res.s400().end();
            } else {
                res.asHTML().send('<pre>').send(crawledUrl).send('</pre>').end();
            }
        }
    }]);

    return Application;
}(_index2.default);

exports.default = Application;