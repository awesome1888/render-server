import {MongoClient} from 'mongodb';

export default class Connection
{
    static async make(url, db)
    {
        return new Promise((resolve, reject) => {
            MongoClient.connect(url, {}, (err, client) => {
                if (err)
                {
                    reject(err);
                }
                else
                {
                    resolve(new this(client, db));
                }
            });
        });
    }

    constructor(client, db)
    {
        this._client = client;
        this._db = client.db(db);
    }

    disconnect()
    {
        this._client.close();
        this._db = null;
        this._client = null;
    }

    collection(name)
    {
        if (!this._db)
        {
            throw new Error('Disconnected');
        }

        return this._db.collection(name);
    }
}
