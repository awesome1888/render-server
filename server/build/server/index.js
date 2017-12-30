'use strict';

var _config = require('./config.js');

var _config2 = _interopRequireDefault(_config);

var _index = require('./application/index.js');

var _index2 = _interopRequireDefault(_index);

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

var _cluster = require('cluster');

var _cluster2 = _interopRequireDefault(_cluster);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var launchApp = function launchApp() {
    // creating worker application, it will share all tcp connections
    // https://linuxtrainers.wordpress.com/2014/12/31/how-fork-system-call-works-what-is-shared-between-parent-and-child-process/
    new _index2.default().launch();
};

if (_config2.default.useCluster) {
    var numCPUs = _os2.default.cpus().length;

    if (_cluster2.default.isMaster) {
        // create workers
        console.dir('Cpu num: ' + numCPUs);
        for (var i = 0; i < numCPUs; i++) {
            _cluster2.default.fork();
        }

        _cluster2.default.on('exit', function (worker, code, signal) {
            console.log('Worker ' + worker.process.pid + ' died, replacing...');
            _cluster2.default.fork();
        });
    } else {
        launchApp();
    }
} else {
    launchApp();
}