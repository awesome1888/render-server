import {MongoClient} from 'mongodb';

export default class Connection
{
    static async make(url)
    {
        return new Promise((resolve, reject) => {
            MongoClient.connect(url, (err, client) => {
                if (err)
                {
                    reject(err);
                }
                else
                {
                    resolve(new this(client));
                }
            });
        });
    }

    constructor(client)
    {
        this._client = client;
    }

    getDatabase(dbName)
    {
        return this._client.db(dbName);
    }

    disconnect()
    {
        this._client.close();
    }
}
