import {Duplex} from 'stream';

export default class Stream extends Duplex
{
    constructor(options)
    {
        options = options || {};
        options.objectMode = true;

        super(options);
        this._buffer = [];
    }

    _write(chunk, encoding, callback)
    {
        this._buffer.push(chunk);
        callback();
    }

    _read(size) {
        const item = this._buffer.shift();
        if (item)
        {
            this.push(item);
        }
    }
}
