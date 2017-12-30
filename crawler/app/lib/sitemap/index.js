import sax from 'sax';
import https from 'https';
import http from 'http';
import _ from 'lodash';
import {Duplex} from 'stream';

// https://stackoverflow.com/questions/19277094/how-to-close-a-readable-stream-before-end
// https://www.npmjs.com/package/destroy

export default class SitemapParser
{
    static async createStream(url, parameters = {})
    {
        parameters = _.isObject(parameters) ? parameters : {};

        const response = await this.getResponseStream(url, parameters);
        const result = this.getResultStream();

        let entry = null;
        let tag = null;

        const saxStream = this.createSaxStream();
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
                    result.write(entry);
                }

                entry = null;
                tag = null;
            }
        });

        response.pipe(saxStream);
        // rock-n-roll
        saxStream.on('data', () => {});

        return null;
    }

    static get(url)
    {

    }

    static getResultStream()
    {
        return new Duplex({
            objectMode: true,
            // read(size) {
            //     // ...
            // },
            write(chunk, encoding, callback) {
                // ...
            }
        });
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

    static async getTransformStream(stream)
    {
        return new Promise((resolve) => {
            stream.pipe(new Transform({
                objectMode: true,
                transform(record, encoding, callback) {
                    fName = record['First Name'];
                    lName = record['Last Name'];
                    name = (`${fName} ${lName}`).trim();

                    cnt += 1;

                    callback(null, {
                        type: 'update',
                        operation: {
                            filter: {
                                nameBot,
                                name,
                            },
                            data: {
                                $set: {
                                    email: record['Email Address'],
                                    company: record.Company,
                                    position: record.Position,
                                },
                            },
                        },
                    });
                }
            })).pipe(this.getContext().getStream()).on('finish', () => {
                this.getContext().flush(); // the last flush
                // this.log(`Bot ${nameBot} finished, ${cnt} records updated`);
                resolve({count: cnt});
            });
        });
    }

    static createSaxStream()
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
        // })

        return saxStream;
    }
}
