import fs from 'fs';

import SitemapGetter from 'sitemap-getter';
import _ from './_.js';
import FSHelper from './fshelper.js';
import Cache from './cache.js';

import Collection from './mongodb/collection.js';

export default class Site
{
    constructor(address, parameters = {})
    {
        this._address = address;
        this._parameters = parameters || {};
    }

    async crawl(browser)
    {
        const parameters = this._parameters;

        const timeout = !isNaN(parameters.timeout) ? parameters.timeout : 5000;
        const cacheFolder = parameters.cacheFolder;

        let locations;
        try
        {
            locations = await SitemapGetter.getLocations(`${this._address}/sitemap.xml`);
        }
        catch(e)
        {
            return;
        }

        if (!_.isArrayNotEmpty(locations))
        {
            return;
        }

        const collection = Collection.wrap(this._parameters.collection);
        const items = (await collection.find({
            address: this._address,
        })).reduce((result, item) => {
            result[item.location] = item.lastCached;
            return result;
        }, {});

        const siteFolder = Cache.makeBaseUrlFolderPath(cacheFolder, this._address);
        await FSHelper.maybeMakeFolder(siteFolder);

        // locations = [{
        //     // this will be normal
        //     loc: 'http://localhost:3001/bQp9GvxFNnrfqcm8w',
        // }, {
        //     loc: 'this.will.be.invalid',
        // },{
        //     loc: 'http://localhost:3001/this.will.be.notfound',
        // },{
        //     loc: 'http://this.will.be.refused',
        // }];

        // We do not create several pages in parallel, it could increase
        // the memory usage which we cant afford on the weak hosing.
        // Parsing several pages "in parallel" could be faster though.
        const page = await browser.newPage();
        await page.setUserAgent('render-server');

        let resolver;
        let ready;

        page.on('console', msg => {
            if (!ready && msg.text === 'CRAWLER_PAGE_READY')
            {
                console.dir('Ready: by message');
                ready = true;
                if (resolver)
                {
                    resolver();
                }
            }
        });

        for(let k = 0; k < locations.length; k++)
        {
            ready = false;
            let location = locations[k].loc;

            if (!_.isStringNotEmptyTrimmed(location))
            {
                continue;
            }

            location = location.trim();
            if ((location in items))
            {
                if (_.isDate(locations[k].lastmod))
                {
                    // if lastmod is defined, then re-cache if lastcached is before lastmod
                    if (!_.isAgo(locations[k].lastmod, 1, items[location]))
                    {
                        continue;
                    }
                }
                else
                {
                    // if lastmod not defined, take now and check the gap of 1 day
                    if (!_.isDaysAgo(new Date(), 1, items[location]))
                    {
                        continue;
                    }
                }
            }

            try
            {
                const response = await page.goto(location);
                if (response.status !== 200)
                {
                    throw new Error(`HTTP: ${response.status}`);
                }

                // wait until the content is ready
                await new Promise((resolve) => {
                    if (ready)
                    {
                        resolve();
                        return;
                    }

                    let timer = null;
                    resolver = () => {
                        resolver = null;
                        if (timer)
                        {
                            clearTimeout(timer);
                        }

                        resolve();
                    };

                    // after the page is loaded, give it ${timeout} milliseconds to finish
                    timer = setTimeout(() => {
                        if (resolver)
                        {
                            console.dir('Ready: by timeout');
                            resolver();
                        }
                    }, timeout);
                });

                // now get the content

                // make the folder to place
                const locationFolder = Cache.makeLocationSubFolderPath(siteFolder, this._address, location);
                await FSHelper.maybeMakeFolder(locationFolder);

                const content = await page.content();

                await new Promise((resolve, reject) => {
                    const filePath = Cache.makeLocationFilePath(siteFolder, this._address, location);
                    fs.writeFile(filePath, content, (err) => {
                        if (err)
                        {
                            reject(err);
                        }
                        else
                        {
                            // console.dir(filePath);
                            resolve();
                        }
                    });
                });

                await collection.update({
                    location,
                }, {
                    $set: {
                        address: this._address,
                        location,
                        lastCached: new Date(),
                    },
                }, {
                    upsert: true,
                });

                console.dir(`Location ${location} -> SUCCESS`);
            }
            catch(e)
            {
                console.dir(`Location ${location} -> ERROR: ${e.message}`);
            }
        }

        await page.close();

        return 1;
    }
}
