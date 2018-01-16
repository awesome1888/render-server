import BaseApplication from '../lib/application/index.js';
import config from '../config.js';
import _ from '../lib/_.js';
import URL from 'url-parse';
import Cache from '../lib/cache.js';
// import fs from 'fs';

export default class Application extends BaseApplication
{
    constructor()
    {
        super(config);
    }

    getRouteMap()
    {
        return [
            {
                path: '/cache',
                handler: this.readCache,
            },
        ];
    }

    readCache(req, res)
    {
        const headers = req.headers;
        const crawledUrl = headers['x-crawled-url'];

        res.asHTML();

        if (!_.isStringNotEmpty(crawledUrl))
        {
            res.s400().send('No crawled URL specified').end();
            return;
        }

        if (!_.isArrayNotEmpty(config.targets) || !_.isStringNotEmpty(config.cacheFolder))
        {
            res.s500().end();
            return;
        }

        const cUrl = new URL(crawledUrl);
        const base = `${cUrl.protocol}${cUrl.slashes ? '//' : '/'}${cUrl.host}`;

        const target = config.targets.find((address) => {
            return address.trim() === base;
        });

        if (!_.isStringNotEmpty(target))
        {
            res.s400().send('Who are you and what do you want?').end();
            return;
        }

        const location = `${target}${cUrl.pathname}`;

        console.dir(target);
        console.dir(cUrl.pathname);
        console.dir(location);
        console.dir(Cache.makeLocationFilePath(config.cacheFolder, target, location));

        res.send('<pre>')
            .send(crawledUrl)
            .send('</pre>')
            .end();
    }
}
