"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

class Collection {
    static wrap(collection) {
        return new this(collection);
    }

    constructor(collection) {
        this._collection = collection;
    }

    find(filter) {
        var _this = this;

        return _asyncToGenerator(function* () {
            return new Promise(function (resolve, reject) {
                _this._collection.find(filter).toArray(function (err, items) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(items);
                    }
                });
            });
        })();
    }

    update(filter, changes, options = {}) {
        var _this2 = this;

        return _asyncToGenerator(function* () {
            return new Promise(function (resolve, reject) {
                _this2._collection.update(filter, changes, options, function (err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            });
        })();
    }
}
exports.default = Collection;