'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _md = require('md5');

var _md2 = _interopRequireDefault(_md);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _sitemapGetter = require('sitemap-getter');

var _sitemapGetter2 = _interopRequireDefault(_sitemapGetter);

var _2 = require('./_.js');

var _3 = _interopRequireDefault(_2);

var _fshelper = require('./fshelper.js');

var _fshelper2 = _interopRequireDefault(_fshelper);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Site = function () {
    function Site(address) {
        var parameters = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        _classCallCheck(this, Site);

        this._address = address;
        this._parameters = parameters || {};
    }

    _createClass(Site, [{
        key: 'crawl',
        value: function () {
            var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(browser) {
                var _this = this;

                var parameters, timeout, cacheFolder, locations, siteFolder, page, _resolver, ready, _loop, k;

                return regeneratorRuntime.wrap(function _callee$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                parameters = this._parameters;
                                timeout = !isNaN(parameters.timeout) ? parameters.timeout : 5000;
                                cacheFolder = parameters.cacheFolder;
                                locations = void 0;
                                _context2.prev = 4;
                                _context2.next = 7;
                                return _sitemapGetter2.default.getLocations(`${this._address}/sitemap.xml`);

                            case 7:
                                locations = _context2.sent;
                                _context2.next = 13;
                                break;

                            case 10:
                                _context2.prev = 10;
                                _context2.t0 = _context2['catch'](4);
                                return _context2.abrupt('return');

                            case 13:
                                if (_3.default.isArrayNotEmpty(locations)) {
                                    _context2.next = 15;
                                    break;
                                }

                                return _context2.abrupt('return');

                            case 15:
                                siteFolder = this.makeSiteFolder(cacheFolder);
                                _context2.next = 18;
                                return _fshelper2.default.maybeMakeFolder(siteFolder);

                            case 18:
                                _context2.next = 20;
                                return browser.newPage();

                            case 20:
                                page = _context2.sent;
                                _context2.next = 23;
                                return page.setUserAgent('render-server');

                            case 23:
                                _resolver = void 0;
                                ready = void 0;


                                page.on('console', function (msg) {
                                    if (!ready && msg.text === 'CRAWLER_PAGE_READY') {
                                        console.dir('Ready: by message');
                                        ready = true;
                                        if (_resolver) {
                                            _resolver();
                                        }
                                    }
                                });

                                _loop = /*#__PURE__*/regeneratorRuntime.mark(function _loop(k) {
                                    var location, response, locationFolder, content;
                                    return regeneratorRuntime.wrap(function _loop$(_context) {
                                        while (1) {
                                            switch (_context.prev = _context.next) {
                                                case 0:
                                                    ready = false;
                                                    location = locations[k].loc;
                                                    _context.prev = 2;
                                                    _context.next = 5;
                                                    return page.goto(location);

                                                case 5:
                                                    response = _context.sent;

                                                    if (!(response.status !== 200)) {
                                                        _context.next = 8;
                                                        break;
                                                    }

                                                    throw new Error(`HTTP: ${response.status}`);

                                                case 8:
                                                    _context.next = 10;
                                                    return new Promise(function (resolve) {
                                                        if (ready) {
                                                            resolve();
                                                            return;
                                                        }

                                                        var timer = null;
                                                        _resolver = function resolver() {
                                                            _resolver = null;
                                                            if (timer) {
                                                                clearTimeout(timer);
                                                            }

                                                            resolve();
                                                        };

                                                        // after the page is loaded, give it ${timeout} milliseconds to finish
                                                        timer = setTimeout(function () {
                                                            if (_resolver) {
                                                                console.dir('Ready: by timeout');
                                                                _resolver();
                                                            }
                                                        }, timeout);
                                                    });

                                                case 10:

                                                    // now get the content

                                                    // make the folder to place
                                                    locationFolder = _this.makeLocationSubFolder(siteFolder, location);
                                                    _context.next = 13;
                                                    return _fshelper2.default.maybeMakeFolder(locationFolder);

                                                case 13:
                                                    _context.next = 15;
                                                    return page.content();

                                                case 15:
                                                    content = _context.sent;
                                                    _context.next = 18;
                                                    return new Promise(function (resolve, reject) {
                                                        var filePath = `${locationFolder}${(0, _md2.default)(location)}`;
                                                        _fs2.default.writeFile(filePath, content, function (err) {
                                                            if (err) {
                                                                reject(err);
                                                            } else {
                                                                // console.dir(filePath);
                                                                resolve();
                                                            }
                                                        });
                                                    });

                                                case 18:

                                                    console.dir(`Location ${location} -> SUCCESS`);
                                                    _context.next = 24;
                                                    break;

                                                case 21:
                                                    _context.prev = 21;
                                                    _context.t0 = _context['catch'](2);

                                                    console.dir(`Location ${location} -> ERROR: ${_context.t0.message}`);

                                                case 24:
                                                case 'end':
                                                    return _context.stop();
                                            }
                                        }
                                    }, _loop, _this, [[2, 21]]);
                                });
                                k = 0;

                            case 28:
                                if (!(k < locations.length)) {
                                    _context2.next = 33;
                                    break;
                                }

                                return _context2.delegateYield(_loop(k), 't1', 30);

                            case 30:
                                k++;
                                _context2.next = 28;
                                break;

                            case 33:
                                _context2.next = 35;
                                return page.close();

                            case 35:
                                return _context2.abrupt('return', 1);

                            case 36:
                            case 'end':
                                return _context2.stop();
                        }
                    }
                }, _callee, this, [[4, 10]]);
            }));

            function crawl(_x2) {
                return _ref.apply(this, arguments);
            }

            return crawl;
        }()
    }, {
        key: 'makeLocationSubFolder',
        value: function makeLocationSubFolder(siteFolder, location) {
            location = _fshelper2.default.secureName(location);

            return `${siteFolder}${(0, _md2.default)(location).substr(1, 3)}/`;
        }
    }, {
        key: 'makeSiteFolder',
        value: function makeSiteFolder(cacheFolder) {
            return `${cacheFolder}${(0, _md2.default)(this._address)}/`;
        }
    }]);

    return Site;
}();

exports.default = Site;