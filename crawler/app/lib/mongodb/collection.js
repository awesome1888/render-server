export default class Collection
{
    static wrap(collection)
    {
        return new this(collection);
    }

    constructor(collection)
    {
        this._collection = collection;
    }

    async find(filter)
    {
        return new Promise((resolve, reject) => {
            this._collection.find(filter).toArray(function(err, items) {
                if (err)
                {
                    reject(err);
                }
                else
                {
                    resolve(items);
                }
            });
        });
    }

    async update(filter, changes, options = {})
    {
        return new Promise((resolve, reject) => {
            this._collection.update(filter, changes, options, (err) => {
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
}
