import {MongoClient} from 'mongodb';

export default class Connection
{
    static async make(url)
    {
        return new Promise((resolve, reject) => {
            MongoClient.connect(url, (err, db) => {
                if (err)
                {
                    reject(err);
                }
                else
                {
                    resolve(new this(db));
                }
            });
        });
    }

    constructor(db)
    {
        this._db = db;
    }

    disconnect()
    {
        this._db.close();
    }
}
