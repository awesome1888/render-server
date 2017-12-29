module.exports = {
    port: 3013,
    useCluster: true,

    crawlTimeout: 3000000,
    cacheFolder: '/home/sergey/crawled-pages/',

    // todo: later move to the database
    targets: [
        'http://foreignsky.ru',
    ],
};
