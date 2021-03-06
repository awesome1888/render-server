'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _sitemapGetter = require('sitemap-getter');

var _sitemapGetter2 = _interopRequireDefault(_sitemapGetter);

var _2 = require('./_.js');

var _3 = _interopRequireDefault(_2);

var _fshelper = require('./fshelper.js');

var _fshelper2 = _interopRequireDefault(_fshelper);

var _cache = require('./cache.js');

var _cache2 = _interopRequireDefault(_cache);

var _collection = require('./mongodb/collection.js');

var _collection2 = _interopRequireDefault(_collection);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

class Site {
    constructor(address, parameters = {}) {
        this._address = address;
        this._parameters = parameters || {};
    }

    crawl(browser) {
        var _this = this;

        return _asyncToGenerator(function* () {
            const parameters = _this._parameters;

            const timeout = !isNaN(parameters.timeout) ? parameters.timeout : 5000;
            const cacheFolder = parameters.cacheFolder;

            let locations;
            try {
                locations = yield _sitemapGetter2.default.getLocations(`${_this._address}/sitemap.xml`);
            } catch (e) {
                return;
            }

            if (!_3.default.isArrayNotEmpty(locations)) {
                return;
            }

            const collection = _collection2.default.wrap(_this._parameters.collection);
            const items = (yield collection.find({
                address: _this._address
            })).reduce(function (result, item) {
                result[item.location] = item.lastCached;
                return result;
            }, {});

            const siteFolder = _cache2.default.makeBaseUrlFolderPath(cacheFolder, _this._address);
            yield _fshelper2.default.maybeMakeFolder(siteFolder);

            // locations = [{
            //     // this will be normal
            //     loc: 'http://localhost:3001/bQp9GvxFNnrfqcm8w',
            // }, {
            //     loc: 'this.will.be.invalid',
            // },{
            //     loc: 'http://localhost:3001/this.will.be.notfound',
            // },{
            //     loc: 'http://this.will.be.refused',
            // }];

            // We do not create several pages in parallel, it could increase
            // the memory usage which we cant afford on the weak hosing.
            // Parsing several pages "in parallel" could be faster though.
            const page = yield browser.newPage();
            yield page.setUserAgent('render-server');

            let resolver;
            let ready;

            page.on('console', function (msg) {
                if (!ready && msg.text === 'CRAWLER_PAGE_READY') {
                    console.dir('Ready: by message');
                    ready = true;
                    if (resolver) {
                        resolver();
                    }
                }
            });

            for (let k = 0; k < locations.length; k++) {
                ready = false;
                let location = locations[k].loc;

                if (!_3.default.isStringNotEmptyTrimmed(location)) {
                    continue;
                }

                location = location.trim();
                if (location in items) {
                    if (_3.default.isDate(locations[k].lastmod)) {
                        // if lastmod is defined, then re-cache if lastcached is before lastmod
                        if (!_3.default.isAgo(locations[k].lastmod, 1, items[location])) {
                            continue;
                        }
                    } else {
                        // if lastmod not defined, take now and check the gap of 1 day
                        if (!_3.default.isDaysAgo(new Date(), 1, items[location])) {
                            continue;
                        }
                    }
                }

                try {
                    const response = yield page.goto(location);
                    if (response.status !== 200) {
                        throw new Error(`HTTP: ${response.status}`);
                    }

                    // wait until the content is ready
                    yield new Promise(function (resolve) {
                        if (ready) {
                            resolve();
                            return;
                        }

                        let timer = null;
                        resolver = function () {
                            resolver = null;
                            if (timer) {
                                clearTimeout(timer);
                            }

                            resolve();
                        };

                        // after the page is loaded, give it ${timeout} milliseconds to finish
                        timer = setTimeout(function () {
                            if (resolver) {
                                console.dir('Ready: by timeout');
                                resolver();
                            }
                        }, timeout);
                    });

                    // now get the content

                    // make the folder to place
                    const locationFolder = _cache2.default.makeLocationSubFolderPath(cacheFolder, _this._address, location);
                    yield _fshelper2.default.maybeMakeFolder(locationFolder);

                    const content = yield page.content();

                    yield new Promise(function (resolve, reject) {
                        const filePath = _cache2.default.makeLocationFilePath(cacheFolder, _this._address, location);
                        _fs2.default.writeFile(filePath, content, function (err) {
                            if (err) {
                                reject(err);
                            } else {
                                // console.dir(filePath);
                                resolve();
                            }
                        });
                    });

                    yield collection.update({
                        location
                    }, {
                        $set: {
                            address: _this._address,
                            location,
                            lastCached: new Date()
                        }
                    }, {
                        upsert: true
                    });

                    console.dir(`Location ${location} -> SUCCESS`);
                } catch (e) {
                    console.dir(`Location ${location} -> ERROR: ${e.message}`);
                }
            }

            yield page.close();

            return 1;
        })();
    }
}
exports.default = Site;