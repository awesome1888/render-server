'use strict';

var _process = require('process');

var _process2 = _interopRequireDefault(_process);

var _config = require('./config.js');

var _config2 = _interopRequireDefault(_config);

var _site = require('./lib/site.js');

var _site2 = _interopRequireDefault(_site);

var _2 = require('./lib/_.js');

var _3 = _interopRequireDefault(_2);

var _fshelper = require('./lib/fshelper.js');

var _fshelper2 = _interopRequireDefault(_fshelper);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var sites = _3.default.getValue(_config2.default, 'targets');
if (!_3.default.isArrayNotEmpty(sites)) {
    _process2.default.exit(0);
}

var puppeteer = require('puppeteer');

puppeteer.launch().then(function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(browser) {
        var cacheFolder;
        return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        cacheFolder = _config2.default.cacheFolder;
                        _context.next = 3;
                        return _fshelper2.default.maybeMakeFolder(cacheFolder);

                    case 3:
                        _context.next = 5;
                        return Promise.all(sites.map(function (address) {
                            var site = new _site2.default(address, {
                                cacheFolder
                            });
                            return site.crawl(browser).catch(function (e) {
                                console.dir(`Website ${address} -> ERROR: ${e.message}`);
                            });
                        }));

                    case 5:

                        console.dir('Finished');

                        browser.close();

                    case 7:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, undefined);
    }));

    return function (_x) {
        return _ref.apply(this, arguments);
    };
}());