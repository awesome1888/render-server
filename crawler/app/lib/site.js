import SitemapGetter from 'sitemap-getter';
import _ from './_.js';

export default class Site
{
    constructor(address)
    {
        this._address = address;
    }

    async crawl(browser)
    {
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

        // We do not create several pages in parallel, it could increase
        // the memory usage which we cant afford on the weak hosing.
        // Parsing several pages "in parallel" could be faster though.
        const page = await browser.newPage();
        await page.setUserAgent('render-server');

        // page.on('console', msg => {
        //     for (let i = 0; i < msg.args.length; ++i)
        //         console.log(`${i}: ${msg.args[i]}`);
        // });

        for(let k = 0; k < data.length; k++)
        {
            const location = data[k].loc;
            console.dir('Going '+location);
            await page.goto(location);
            const content = await page.content();
            console.dir('crawled '+location);
        }

        return 1;
    }
}
