'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _mongodb = require('mongodb');

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

class Connection {
    static make(url) {
        var _this = this;

        return _asyncToGenerator(function* () {
            return new Promise(function (resolve, reject) {
                _mongodb.MongoClient.connect(url, function (err, client) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(new _this(client));
                    }
                });
            });
        })();
    }

    constructor(client) {
        this._client = client;
    }

    getDatabase(dbName) {
        return this._client.db(dbName);
    }

    disconnect() {
        this._client.close();
    }
}
exports.default = Connection;