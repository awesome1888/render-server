'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SugarResponse = function () {
    function SugarResponse(res) {
        _classCallCheck(this, SugarResponse);

        if (!res) {
            throw new TypeError('Argument is not an Express Response');
        }

        this._r = res;
        this._headersSent = res._headersSent;
        this._headers = {};
    }

    /**
     * @param source String|ReadableStream
     * @param options
     */


    _createClass(SugarResponse, [{
        key: 'streamFile',
        value: function streamFile(source, options) {
            var _this = this;

            options = options || {};

            var onBeforeOpen = _underscore2.default.isFunction(options.onBeforeOpen) ? options.onBeforeOpen : null;

            var setLength = true;
            if ('setLength' in options) {
                setLength = !!options.setLength;
            }

            var asAttachment = false;
            if ('asAttachment' in options) {
                asAttachment = !!options.asAttachment;
            }

            var setErrorCode = true;
            if ('setErrorCode' in options) {
                setErrorCode = !!options.setErrorCode;
            }

            var fileName = null;
            if (this.isStringNotEmpty(options.fileName)) {
                fileName = options.fileName;
            }

            var escapeDots = true;
            if ('escapeDots' in options) {
                escapeDots = !!options.escapeDots;
            }

            var doEnd = true;
            if ('doEnd' in options) {
                doEnd = !!options.doEnd;
            }

            if (escapeDots && this.isStringNotEmpty(source)) {
                source = source.replace(/\.+/g, '.');
            }

            var p = new Promise(function (resolve, reject) {
                var doStream = function doStream() {
                    var stream = source;
                    if (_this.isStringNotEmpty(source)) {
                        stream = _fs2.default.createReadStream(source);
                    }

                    stream.on('error', function (error) {
                        reject({ self: _this, error: error });
                    });
                    stream.on('end', function () {
                        stream.destroy();
                        resolve({ self: _this });
                    });
                    stream.on('open', function () {
                        if (asAttachment) {
                            if (fileName !== null) {
                                // todo: extract real file name here
                                fileName = 'file';
                            }

                            _this.asAttachment(fileName);
                        }

                        _this.sendHeaders();

                        if (_underscore2.default.isFunction(onBeforeOpen)) {
                            onBeforeOpen(_this);
                        }
                    });

                    stream.pipe(_this._r);
                };

                if (setLength) {
                    // find out the length first
                    _fs2.default.stat(source, function (error, stat) {
                        if (error) {
                            reject({ self: _this, error: error });
                        } else {
                            _this.contentLength(stat.size);
                            doStream();
                        }
                    });
                } else {
                    doStream();
                }
            });

            var setError = function setError(e) {
                if (e.code === 'ENOENT') {
                    _this.s404();
                } else if (e.code === 'EACCES') {
                    _this.s403();
                } else {
                    _this.s500();
                }
            };

            if (doEnd) {
                p.then(function () {
                    _this.end();
                }).catch(function (result) {
                    if (setErrorCode) {
                        setError(result.error);
                    }
                    _this.end();
                });
            } else if (setErrorCode) {
                p.catch(function (result) {
                    setError(result.error);
                });
            }

            return p;
        }

        /**
         * https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Complete_list_of_MIME_types
         * @param type
         * @returns {SugarResponse}
         */

    }, {
        key: 'contentType',
        value: function contentType(type) {
            return this.header('Content-Type', type);
        }
    }, {
        key: 'cache',
        value: function cache(amount) {
            if (!amount) {
                amount = 0;
            } else {
                amount = amount.toString();

                if (amount.endsWith('d')) {
                    amount = parseInt(amount.substr(0, amount.length - 1)) * 86400;
                }
            }

            return this.cacheControl('public, max-age=' + amount);
        }
    }, {
        key: 'noCache',
        value: function noCache() {
            return this.cacheControl('no-cache, no-store, must-revalidate');
        }
    }, {
        key: 'cacheControl',
        value: function cacheControl(value) {
            return this.header('Cache-Control', value);
        }
    }, {
        key: 'asAttachment',
        value: function asAttachment(fileName) {
            fileName = fileName || null;
            this.header('Content-Description', 'File Transfer');
            this.header('Content-Disposition', 'attachment');
            this.attachmentFileName(fileName);

            return this;
        }
    }, {
        key: 'attachmentFileName',
        value: function attachmentFileName(name) {
            if (name) {
                return this.header('Content-Disposition', 'filename="' + name + '"');
            }

            return this;
        }
    }, {
        key: 'contentLength',
        value: function contentLength(length) {
            length = length || 0;
            return this.header('Content-Length', length);
        }

        // todo: support cookie parameters:
        // todo: see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie

    }, {
        key: 'cookie',
        value: function cookie(name, value, options) {
            options = options || {};
            this._r.cookie(name, value, options);

            return this;
        }
    }, {
        key: 'as',
        value: function as(type) {
            return this.contentType(type);
        }
    }, {
        key: 'asPDF',
        value: function asPDF() {
            return this.as('application/pdf');
        }
    }, {
        key: 'asCSV',
        value: function asCSV() {
            return this.as('text/csv');
        }
    }, {
        key: 'asBinary',
        value: function asBinary() {
            return this.as('application/octet-stream');
        }
    }, {
        key: 'asGIF',
        value: function asGIF() {
            return this.as('image/gif');
        }
    }, {
        key: 'asJPG',
        value: function asJPG() {
            return this.as('image/jpeg');
        }
    }, {
        key: 'asPNG',
        value: function asPNG() {
            return this.as('image/png');
        }
    }, {
        key: 'asText',
        value: function asText() {
            return this.as('text/plain');
        }
    }, {
        key: 'asHTML',
        value: function asHTML() {
            return this.as('text/html');
        }
    }, {
        key: 'asJSON',
        value: function asJSON() {
            return this.as('text/json');
        }
    }, {
        key: 'charset',
        value: function charset(_charset) {
            _charset = _charset || 'utf8';
            return this.header('Content-Type', 'charset=' + _charset);
        }

        /**
         * See
         * https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers
         * https://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html
         * @param name
         * @param value
         * @returns {SugarResponse}
         */

    }, {
        key: 'header',
        value: function header(name, value) {
            value = value || null;
            if (this._headersSent) {
                throw new Error('Headers already sent');
            }

            if (!this.isStringNotEmpty(name)) {
                return this;
            }

            if (value === null) {
                delete this._headers[name];
                return this;
            }

            var group = this.groupHeaderValueFor();

            if (name in group.multiple) {
                this._headers[name] = _underscore2.default.union(this._headers[name] || [], value.split(',').map(function (x) {
                    return x.trim();
                }));
            } else if (name in group.directiveBased) {
                var pValue = this._headers[name] || {};
                this._headers[name] = Object.assign(pValue, group.directiveBased[name].parser(value.split(';').map(function (x) {
                    return x.trim();
                }), pValue));
            } else {
                this._headers[name] = this._headers[name] || [];
                this._headers[name].push(value);
            }

            return this;
        }
    }, {
        key: 'trailer',
        value: function trailer(name, value) {
            // todo

            return this;
        }
    }, {
        key: 's500',
        value: function s500() {
            return this.status(500);
        }
    }, {
        key: 's404',
        value: function s404() {
            return this.status(404);
        }
    }, {
        key: 's403',
        value: function s403() {
            return this.status(403);
        }
    }, {
        key: 's400',
        value: function s400() {
            return this.status(400);
        }
    }, {
        key: 's200',
        value: function s200() {
            return this.status(200);
        }
    }, {
        key: 'status',
        value: function status(code) {
            code = code || 200;
            if (this._headersSent) {
                throw new Error('Headers already sent');
            }

            this._r.status(code);
            return this;
        }
    }, {
        key: 'sendHeaders',
        value: function sendHeaders() {
            var _this2 = this;

            if (!this._headersSent) {
                var group = this.groupHeaderValueFor();

                // console.dir('Headers:');
                // console.dir(this._headers);

                _underscore2.default.forEach(this._headers, function (value, name) {
                    if (name in group.multiple) {
                        value = value.join(', ');

                        _this2._r.setHeader(name, value);
                    } else if (name in group.directiveBased) {
                        var order = group.directiveBased[name].order;

                        value = order.reduce(function (result, item) {
                            if (value[item]) {
                                result.push(value[item]);
                            }

                            return result;
                        }, []).join('; ');

                        _this2._r.setHeader(name, value);
                    } else {
                        value.forEach(function (subValue) {
                            console.dir(name + ' ' + subValue);
                            _this2._r.setHeader(name, subValue);
                        });
                    }
                });

                this._headersSent = true;
            }
        }

        /**
         * appends to an internal buffer
         */

    }, {
        key: 'append',
        value: function append(data) {
            // todo
        }
    }, {
        key: 'write',
        value: function write(data) {
            this.sendHeaders();
            this._r.write(data);
            return this;
        }

        /**
         * flush internal buffer and optionally sends the data specified
         */

    }, {
        key: 'send',
        value: function send(data) {
            data = data || '';
            if (data) {
                if (_underscore2.default.isObject(data)) {
                    this.asJSON();
                    data = JSON.stringify(data);
                }
            }

            this.sendHeaders();

            // todo: send from the internal buffer

            if (data) {
                this._r.write(data);
            }

            return this;
        }
    }, {
        key: 'end',
        value: function end() {
            this.sendHeaders();
            this._r.end();
        }
    }, {
        key: 'getRes',
        value: function getRes() {
            return this._r;
        }
    }, {
        key: 'groupHeaderValueFor',
        value: function groupHeaderValueFor() {
            return {
                multiple: {
                    'Cache-Control': true,
                    'Content-Language': true
                },
                directiveBased: {
                    'Content-Disposition': {
                        order: ['TYPE', 'NAME', 'FILENAME'],
                        parser: this.parseContentDisposition
                    },
                    'Content-Type': {
                        order: ['MIME', 'CHARSET'],
                        parser: this.parseContentType
                    }
                }
            };
        }
    }, {
        key: 'parseContentDisposition',
        value: function parseContentDisposition(value, previousValue) {
            var result = {};

            value.forEach(function (item) {
                if (item.startsWith('filename=')) {
                    result.FILENAME = item;
                    if (!previousValue.TYPE) {
                        result.TYPE = 'attachment';
                    }
                }

                if (item === 'attachment' || item === 'inline') {
                    result.TYPE = item;
                }
            });

            return result;
        }
    }, {
        key: 'parseContentType',
        value: function parseContentType(value, previousValue) {
            var result = {};

            value.forEach(function (item) {
                if (item.startsWith('charset=')) {
                    result.CHARSET = item;
                    if (!previousValue.MIME) {
                        result.MIME = 'text/plain';
                    }
                }

                if (item.match(/^[^\/]+\/[^\/]+$/i)) {
                    result.MIME = item;
                }
            });

            return result;
        }
    }, {
        key: 'isStringNotEmpty',
        value: function isStringNotEmpty(value) {
            return _underscore2.default.isString(value) && value.length;
        }
    }]);

    return SugarResponse;
}();

exports.default = SugarResponse;