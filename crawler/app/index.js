import process from 'process';

import config from './config.js';
import Site from './lib/site.js';
import _ from './lib/_.js';
import FSHelper from './lib/fshelper.js';

const sites = _.getValue(config, 'targets');
if (!_.isArrayNotEmpty(sites))
{
    process.exit(0);
}

const puppeteer = require('puppeteer');

puppeteer.launch().then(async (browser) => {

    const cacheFolder = config.cacheFolder;
    await FSHelper.maybeMakeFolder(cacheFolder);

    await Promise.all(sites.map((address) => {
        const site = new Site(address, {
            cacheFolder,
        });
        return site.crawl(browser).catch((e) => {
            console.dir(`Website ${address} -> ERROR: ${e.message}`);
        });
    }));

    console.dir('Finished');
    
    browser.close();
});
