'use strict';

module.exports = {
    port: 11004,
    useCluster: true,

    crawlTimeout: 5000,
    cacheFolder: '/home/sergey/crawled-pages/',
    mongodb: 'mongodb://renderserver:NSgAe7NX2UXEEP2@localhost:27017/renderserver',
    // mongodbURL: 'mongodb://localhost:27017',
    // mongodbName: 'renderserver',
    // mongodbUserName: 'renderserver',
    // mongodbUserPassword: '',

    // todo: later move to the database
    targets: ['https://foreignsky.ru']
};