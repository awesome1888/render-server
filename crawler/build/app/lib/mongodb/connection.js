'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _mongodb = require('mongodb');

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

class Connection {
    static make(url, db) {
        var _this = this;

        return _asyncToGenerator(function* () {
            return new Promise(function (resolve, reject) {
                _mongodb.MongoClient.connect(url, {}, function (err, client) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(new _this(client, db));
                    }
                });
            });
        })();
    }

    constructor(client, db) {
        this._client = client;
        this._db = client.db(db);
    }

    disconnect() {
        this._client.close();
        this._db = null;
        this._client = null;
    }

    collection(name) {
        if (!this._db) {
            throw new Error('Disconnected');
        }

        return this._db.collection(name);
    }
}
exports.default = Connection;