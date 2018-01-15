import BaseApplication from '../lib/application/index.js';
import config from '../config.js';
// import _ from '../lib/_.js';
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
        res.asHTML()
            .send('<pre>')
            .send(JSON.stringify(req.query))
            .send('</pre>')
            .send('<br />')
            .send(req.protocol + '://' + req.get('host') + req.originalUrl)
            .send('<br />')
            .send('<pre>')
            .send(JSON.stringify(req.headers))
            .send('</pre>')
            .end();
    }
}
