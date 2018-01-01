'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

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

            const siteFolder = _this.makeSiteFolder(cacheFolder);
            yield _fshelper2.default.maybeMakeFolder(siteFolder);

            locations = [{
                // this will be normal
                loc: 'http://localhost:3001/bQp9GvxFNnrfqcm8w'
            }, {
                loc: 'this.will.be.invalid'
            }, {
                loc: 'http://localhost:3001/this.will.be.notfound'
            }, {
                loc: 'http://this.will.be.refused'
            }];

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
                const location = locations[k].loc;

                if (!_3.default.isStringNotEmpty(location)) {
                    continue;
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
                    const locationFolder = _this.makeLocationSubFolder(siteFolder, location);
                    yield _fshelper2.default.maybeMakeFolder(locationFolder);

                    const content = yield page.content();

                    yield new Promise(function (resolve, reject) {
                        const filePath = `${locationFolder}${(0, _md2.default)(location)}`;
                        _fs2.default.writeFile(filePath, content, function (err) {
                            if (err) {
                                reject(err);
                            } else {
                                // console.dir(filePath);
                                resolve();
                            }
                        });
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

    makeLocationSubFolder(siteFolder, location) {
        location = _fshelper2.default.secureName(location);

        return `${siteFolder}${(0, _md2.default)(location).substr(1, 3)}/`;
    }

    makeSiteFolder(cacheFolder) {
        return `${cacheFolder}${(0, _md2.default)(this._address)}/`;
    }
}
exports.default = Site;