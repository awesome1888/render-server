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

var _connection = require('./lib/mongodb/connection.js');

var _connection2 = _interopRequireDefault(_connection);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const sites = _3.default.getValue(_config2.default, 'targets');
if (!_3.default.isArrayNotEmpty(sites)) {
    _process2.default.exit(0);
}

const puppeteer = require('puppeteer');

puppeteer.launch().then((() => {
    var _ref = _asyncToGenerator(function* (browser) {

        const cacheFolder = _config2.default.cacheFolder;
        let db;

        try {
            yield _fshelper2.default.maybeMakeFolder(cacheFolder);

            const db = yield _connection2.default.make(_config2.default.mongodb.connection, _config2.default.mongodb.database);

            yield Promise.all(sites.map(function (address) {
                const site = new _site2.default(address, {
                    cacheFolder,
                    collection: db.collection('site'),
                    timeout: _config2.default.crawlTimeout
                });
                return site.crawl(browser).catch(function (e) {
                    console.dir(`Website ${address} -> ERROR: ${e.message}`);
                });
            }));

            console.dir('Finished');

            db.disconnect();
            browser.close();
        } catch (e) {
            console.dir(`Error: ${e.message}`);

            if (db) {
                db.disconnect();
            }
            browser.close();
        }
    });

    return function (_x) {
        return _ref.apply(this, arguments);
    };
})());