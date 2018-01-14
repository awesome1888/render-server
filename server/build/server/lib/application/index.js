'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _index = require('../sugar-response/index.js');

var _index2 = _interopRequireDefault(_index);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// import _ from '../lib/_.js';
// let debug = require('debug')('node-express-gen:server');

var Application = function () {
    // _settings = null;
    // _server = null;

    function Application(settings) {
        _classCallCheck(this, Application);

        this._settings = settings || {};
    }

    _createClass(Application, [{
        key: 'getRouteMap',
        value: function getRouteMap() {
            return [];
        }
    }, {
        key: 'launch',
        value: function launch() {
            this.attachMiddleware();
            this.createServer();
        }
    }, {
        key: 'attachMiddleware',
        value: function attachMiddleware() {
            var ex = this.getExpress();

            ex.use(_bodyParser2.default.json());
            ex.use(_bodyParser2.default.urlencoded({
                extended: false
            }));

            // ex.use(logger('dev'));
            // ex.use(passport.initialize());
            // ex.use(express.static(path.join(__dirname, 'public')));

            this.attachRoutes();
            this.attach404();
        }
    }, {
        key: 'attachRoutes',
        value: function attachRoutes() {
            var _this = this;

            var routes = this.getRouteMap();
            var router = this.getRouter();

            this.getRouteMap().forEach(function (route) {
                // todo: support only POST and only GET
                router.all(route.path, function (req, res, next) {
                    route.handler.apply(this, [req, new _index2.default(res), next]);
                }.bind(_this));
            });

            this.getExpress().use('/', router);
        }
    }, {
        key: 'attach404',
        value: function attach404() {
            var _this2 = this;

            this.getExpress().use(function (req, res, next) {
                if (_this2.isDevelopment()) {
                    var err = new Error('Not Found');
                    err.status = 404;
                    next(err);
                } else {
                    _this2.send404(res);
                }
            });
        }
    }, {
        key: 'createServer',
        value: function createServer() {
            var e = this.getExpress();

            var port = this.getPort();
            e.set('port', port);

            var server = _http2.default.createServer(e);

            server.listen(port);
            server.on('error', this.onError.bind(this));
            server.on('listening', this.onListening.bind(this));

            this._server = server;
        }
    }, {
        key: 'getServer',
        value: function getServer() {
            return this._server;
        }
    }, {
        key: 'getExpress',
        value: function getExpress() {
            if (!this._express) {
                this._express = (0, _express2.default)();
                this._express.disable('x-powered-by'); // decrease the level of pathos
            }

            return this._express;
        }
    }, {
        key: 'getRouter',
        value: function getRouter() {
            return _express2.default.Router();
        }
    }, {
        key: 'onError',
        value: function onError(error) {
            if (error.syscall !== 'listen') {
                throw error;
            }

            var bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

            // handle specific listen errors with friendly messages
            switch (error.code) {
                case 'EACCES':
                    console.error(bind + ' requires elevated privileges');
                    process.exit(1);
                    break;
                case 'EADDRINUSE':
                    console.error(bind + ' is already in use');
                    process.exit(1);
                    break;
                default:
                    throw error;
            }
        }
    }, {
        key: 'onListening',
        value: function onListening() {
            var addr = this.getServer().address();
            var bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
            console.dir('Listening on ' + bind);
        }
    }, {
        key: 'getPort',
        value: function getPort() {
            return this.getSettings().port || 3012;
        }
    }, {
        key: 'getSettings',
        value: function getSettings() {
            return this._settings || {};
        }
    }, {
        key: 'isDevelopment',
        value: function isDevelopment() {
            return this.getExpress().get('env') === 'development';
        }
    }, {
        key: 'send404',
        value: function send404(res) {
            res.status(404);
            res.end('Not found');
        }
    }, {
        key: 'send400',
        value: function send400(res) {
            res.status(400);
            res.end('Bad request');
        }
    }, {
        key: 'send500',
        value: function send500(res) {
            res.status(500);
            res.end('Internal server error');
        }
    }]);

    return Application;
}();

// error handlers

// development error handler
// will print stacktrace
// if (app.get('env') === 'development') {
//     app.use(function(err, req, res, next) {
//         res.status(err.status || 500);
//         res.json({
//             message: err.message,
//             error: err
//         });
//     });
// }

// production error handler
// no stacktraces leaked to user
// app.use(function(err, req, res, next) {
//     res.status(err.status || 500);
//     res.json({
//         message: err.message,
//         error: {}
//     });
// });


exports.default = Application;