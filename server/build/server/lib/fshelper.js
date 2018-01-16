'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// to make babel-ed async functions work in nodejs 4.x or prior to
// todo: prepend it automatically on build
var regeneratorRuntime = require("regenerator-runtime");

var FSHelper = function () {
    function FSHelper() {
        _classCallCheck(this, FSHelper);
    }

    _createClass(FSHelper, null, [{
        key: 'isExists',
        value: function () {
            var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(folder) {
                return regeneratorRuntime.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                return _context.abrupt('return', new Promise(function (resolve) {
                                    _fs2.default.stat(folder, function (err) {
                                        // todo: poor check
                                        resolve(!err);
                                    });
                                }));

                            case 1:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));

            function isExists(_x) {
                return _ref.apply(this, arguments);
            }

            return isExists;
        }()
    }, {
        key: 'unlink',
        value: function () {
            var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(file) {
                return regeneratorRuntime.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                return _context2.abrupt('return', new Promise(function (resolve, reject) {
                                    _fs2.default.unlink(file, function (err) {
                                        if (err) {
                                            reject(err);
                                        } else {
                                            resolve(true);
                                        }
                                    });
                                }));

                            case 1:
                            case 'end':
                                return _context2.stop();
                        }
                    }
                }, _callee2, this);
            }));

            function unlink(_x2) {
                return _ref2.apply(this, arguments);
            }

            return unlink;
        }()
    }, {
        key: 'maybeMakeFolder',
        value: function () {
            var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(folder) {
                var exists;
                return regeneratorRuntime.wrap(function _callee3$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                                _context3.next = 2;
                                return this.isExists(folder);

                            case 2:
                                exists = _context3.sent;

                                if (!exists) {
                                    _context3.next = 5;
                                    break;
                                }

                                return _context3.abrupt('return', true);

                            case 5:
                                return _context3.abrupt('return', new Promise(function (resolve, reject) {
                                    _fs2.default.mkdir(folder, 493, function (err) {
                                        if (err) {
                                            reject(err);
                                        } else {
                                            resolve(true);
                                        }
                                    });
                                }));

                            case 6:
                            case 'end':
                                return _context3.stop();
                        }
                    }
                }, _callee3, this);
            }));

            function maybeMakeFolder(_x3) {
                return _ref3.apply(this, arguments);
            }

            return maybeMakeFolder;
        }()
    }, {
        key: 'secureName',
        value: function secureName(name) {
            return name.replace(/\.+/g, '.');
        }
    }]);

    return FSHelper;
}();

exports.default = FSHelper;