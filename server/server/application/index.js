import BaseApplication from '../lib/application/index.js';
import config from '../config.js';
import _ from '../lib/_.js';
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
                handler: this.processUrl,
            },
        ];
    }

    processUrl(req, res)
    {
        const headers = req.headers;
        const crawledUrl = headers['x-crawled-url'];

        if (!_.isStringNotEmpty(crawledUrl))
        {
            res.s400().end();
        }
        else
        {
            res.asHTML()
                .send('<pre>')
                .send(crawledUrl)
                .send('</pre>')
                .end();
        }
    }
}
