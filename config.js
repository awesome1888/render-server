module.exports = {
    port: 3013,
    useCluster: true,

    crawlTimeout: 3000000,
    cacheFolder: '/home/sergey/crawled-pages/',
    mongodbURL: 'mongodb://localhost:27017',
    mongodbName: 'renderserver',

    // todo: later move to the database
    targets: [
        'https://foreignsky.ru',
    ],
};
