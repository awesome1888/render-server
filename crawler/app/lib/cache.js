import md5 from 'md5';
import FSHelper from './fshelper.js';

export default class Cache
{
    static makeLocationFilePath(cacheFolder, baseUrl, location)
    {
        return `${this.makeLocationSubFolderPath(cacheFolder, baseUrl, location)}${md5(location)}`
    }

    static makeLocationSubFolderPath(cacheFolder, baseUrl, location)
    {
        location = FSHelper.secureName(location);

        return `${this.makeBaseUrlFolderPath(cacheFolder, baseUrl)}${md5(location).substr(0, 3)}/`;
    }

    static makeBaseUrlFolderPath(cacheFolder, baseUrl)
    {
        return `${cacheFolder}${md5(baseUrl)}/`;
    }
}
