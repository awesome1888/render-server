import sax from 'sax';
import https from 'https';
import http from 'http';
import _ from 'lodash';

import ResultStream from './lib/stream.js';

// https://stackoverflow.com/questions/19277094/how-to-close-a-readable-stream-before-end
// https://www.npmjs.com/package/destroy

export default class SitemapParser
{
    static async createStream(url, parameters = {})
    {
        parameters = _.isObject(parameters) ? parameters : {};

        const response = await this.getResponseStream(url, parameters);
        const result = this.getResultStream();
        const saxStream = this.getSaxStream((entry) => {
            result.write(entry);
        }, parameters);

        response.pipe(saxStream);
        saxStream.on('data', () => {}); // full steam ahead!

        return result;
    }

    static get(url)
    {

    }

    static getSaxStream(onEntry, parameters = {})
    {
        const saxStream = sax.createStream(true, {
            normalize: true,
        });
        // saxStream.on("error", function (e) {
        //     // unhandled errors will throw, since this is a proper node
        //     // event emitter.
        //     console.error("error!", e)
        //     // clear the error
        //     this._parser.error = null
        //     this._parser.resume()
        // });

        let entry = null;
        let tag = null;

        saxStream.on('opentag', (node) => {
            if (node.name === 'url')
            {
                entry = {};
            }
            else
            {
                if (entry)
                {
                    tag = node.name;
                }
            }
        });
        saxStream.on('text', (text) => {
            text = text.trim();
            if (!text.length)
            {
                // whitespace or line feed, skipping
                return;
            }

            if (tag === 'loc' || tag === 'changefreq' || tag === 'priority')
            {
                entry[tag] = text;
            }
            else if (tag === 'lastmod')
            {
                entry.lastmod = new Date(text);
            }
        });
        saxStream.on('closetag', (nodeName) => {
            if (nodeName === 'url')
            {
                if (entry !== null)
                {
                    // send to the output stream...
                    onEntry(entry);
                }

                entry = null;
                tag = null;
            }
        });

        return saxStream;
    }

    static getResultStream()
    {
        return new ResultStream();
    }

    static async getResponseStream(url, parameters = {})
    {
        return new Promise((resolve, reject) => {
            const request = https.get(url, (response) => {
                // todo: support 301 and 302 redirects here
                if (response.statusCode.toString() !== '200')
                {
                    reject(new Error(`HTTP: ${response.statusCode}`));
                    return;
                }

                resolve(response);
            });

            if (!isNaN(parameters.timeout))
            {
                request.setTimeout(parameters.timeout, () => {
                    reject(new Error('Timeout'));
                });
            }

            request.on('error', (error) => {
                reject(error);
            });
        });
    }
}
