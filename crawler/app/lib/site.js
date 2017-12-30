import md5 from 'md5';
import fs from 'fs';

import SitemapGetter from 'sitemap-getter';
import _ from './_.js';
import FSHelper from './fshelper.js';

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
        console.dir(parameters);

        const timeout = !isNaN(parameters.timeout) ? parameters.timeout : 5000;
        const cacheFolder = parameters.cacheFolder;

        let data;
        try
        {
            data = await SitemapGetter.getLocations(`${this._address}/sitemap.xml`);
        }
        catch(e)
        {
            return;
        }

        if (!_.isArrayNotEmpty(data))
        {
            return;
        }

        const siteFolder = this.makeSiteFolder(cacheFolder);
        console.dir('sf: '+siteFolder);
        await FSHelper.maybeMakeFolder(siteFolder);

        data = [{
            loc: 'http://localhost:3001/bQp9GvxFNnrfqcm8w',
            // loc: 'http://localhost:3001/PikPMHZN7iqQTKwpC',
        }, {
            loc: 'shit',
        }];

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
                // console.dir('ready by message');
                ready = true;
                if (resolver)
                {
                    resolver();
                }
            }
        });

        for(let k = 0; k < data.length; k++)
        {
            ready = false;
            const location = data[k].loc;

            await page.goto(location);

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
                        // console.dir('ready by timeout');
                        resolver();
                    }
                }, timeout);
            });

            // now get the content

            // make the folder to place
            const locationFolder = this.makeLocationSubFolder(siteFolder, location);
            await FSHelper.maybeMakeFolder(locationFolder);

            const content = await page.content();

            await new Promise((resolve, reject) => {
                fs.writeFile(`${locationFolder}${md5(location)}`, content, (err) => {
                    if (err)
                    {
                        reject(err);
                    }
                    else
                    {
                        resolve();
                    }
                });
            });
        }

        await page.close();

        return 1;
    }

    makeLocationSubFolder(siteFolder, location)
    {
        location = FSHelper.secureName(location);

        return `${siteFolder}${md5(location).substr(1, 3)}/`;
    }

    makeSiteFolder(cacheFolder)
    {
        return `${cacheFolder}${md5(this._address)}/`;
    }
}
