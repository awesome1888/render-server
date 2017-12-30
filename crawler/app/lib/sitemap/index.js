import sax from 'sax';
import https from 'https';
import http from 'http';
import _ from 'lodash';

import ResultStream from './lib/stream.js';

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
        response.on('end', () => {
            response.unpipe();
            response.destroy();
        });

        return result;
    }

    static async get(url, parameters = {})
    {
        parameters = _.isObject(parameters) ? parameters : {};

        const response = await this.getResponseStream(url, parameters);
        const result = [];
        const saxStream = this.getSaxStream((entry) => {
            result.push(entry);
        }, parameters);

        response.pipe(saxStream);
        response.on('end', () => {
            response.unpipe();
            response.destroy();
        });

        return new Promise((resolve) => {
            saxStream.on('end', () => {
                resolve(result);
            });
            saxStream.on('data', () => {}); // full steam ahead! get all of them!
        });
    }

    static getSaxStream(onEntry, parameters = {})
    {
        const saxStream = sax.createStream(true, {
            normalize: true,
        });

        if (parameters.skipParseErrors)
        {
            saxStream.on("error", function (e) {
                this._parser.error = null;
                this._parser.resume();
            });
        }

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
            const request = this.getAPIByUrl(url).get(url, (response) => {
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

    static getAPIByUrl(url)
    {
        url = this.normalizeUrl(url);
        if (!url.length)
        {
            throw new RangeError('Bad url');
        }

        return url.startsWith('https:') ? https : http;
    }

    static normalizeUrl(url)
    {
        if (!_.isString(url))
        {
            return '';
        }

        return url.trim();
    }
}
