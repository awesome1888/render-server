'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

class FSHelper {
    static isExists(folder) {
        return _asyncToGenerator(function* () {
            return new Promise(function (resolve) {
                _fs2.default.stat(folder, function (err) {
                    // todo: poor check
                    resolve(!err);
                });
            });
        })();
    }

    static unlink(file) {
        return _asyncToGenerator(function* () {
            return new Promise(function (resolve, reject) {
                _fs2.default.unlink(file, function (err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(true);
                    }
                });
            });
        })();
    }

    static maybeMakeFolder(folder) {
        var _this = this;

        return _asyncToGenerator(function* () {
            const exists = yield _this.isExists(folder);
            if (exists) {
                return true;
            }

            return new Promise(function (resolve, reject) {
                _fs2.default.mkdir(folder, 0o755, function (err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(true);
                    }
                });
            });
        })();
    }

    static secureName(name) {
        return name.replace(/\.+/g, '.');
    }
}
exports.default = FSHelper;