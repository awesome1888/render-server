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
                path: '/:url',
                handler: this.processHome,
            },
        ];
    }

    processHome(req, res)
    {
        res.asText().send(JSON.stringify(req.query)).send("\n").send(req.protocol + '://' + req.get('host') + req.originalUrl).end();
    }
}
