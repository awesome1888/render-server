import process from 'process';

import config from './config.js';
import Site from './lib/site.js';
import _ from './lib/_.js';

const sites = _.getValue(config, 'targets');
if (!_.isArrayNotEmpty(sites))
{
    process.exit(0);
}

const puppeteer = require('puppeteer');

puppeteer.launch().then(async (browser) => {
    await Promise.all(sites.map((address) => {
        const site = new Site(address);
        return site.crawl(browser);
    }));

    browser.close();
});

// import fs from 'fs';
// var system = require('system');
// var webpage = require('webpage');
//
// var url = system.args[1];
// if (!url)
// {
//     phantom.exit();
// }
//
// var page = webpage.create();
// page.customHeaders = {
//     "User-Agent": "render-server",
// };
//
// ////////////////////////////////
// ////////////////////////////////
//
// page.onConsoleMessage = function(msg) {
//     console.log(msg);
// };
// page.open(url, function(status) {
//     console.log('Status: '+status);
//
//     var result = page.evaluate(function(){
//
//         var result = ['lala'];
//
//         return result;
//     });
//
//     console.dir(result);
//
//     // page.includeJs("http://ajax.googleapis.com/ajax/libs/jquery/1.6.1/jquery.min.js", function() {
//     //     var result = page.evaluate(function(){
//     //
//     //         var result = [];
//     //
//     //         $('.color-picker').each(function(i, item) {
//     //             var itemJq = $(item);
//     //
//     //             var colorName = itemJq.find('.color-name').text().toUpperCase();
//     //             var colorHex = itemJq.find('.hex-number').text();
//     //
//     //             result.push({
//     //                 name: colorName,
//     //                 value: colorHex,
//     //             });
//     //         });
//     //
//     //         return result;
//     //     });
//     //
//     //
//     //     // fs.write(output, strResult, 'w');
//     //     // fs.write(outputLess, strResultLess, 'w');
//     //     // fs.write(outputPrimitives, strResultLessPrimitives, 'w');
//     //     // fs.write(outputPrimitivesF, strResultLessPrimitivesF, 'w');
//     //     system.stdout.writeLine('\nHello, system.stdout.writeLine!');
//     //
//     //     phantom.exit();
//     // });
// });
//
// // const puppeteer = require('puppeteer');
// // const fs = require('fs');
// //
// // (() => {
// //     let b = null;
// //     let p = null;
// //
// //     puppeteer.launch().then((browser) => {
// //         b = browser;
// //         return browser.newPage();
// //     }).then((page) => {
// //         p = page;
// //         return page.goto('https://foreignsky.ru/pzwfCkCN2KmjRRERX');
// //     }).then(() => {
// //         return new Promise((resolve) => {
// //             setTimeout(() => {
// //                 // p.screenshot({path: 'example.png'}).then(() => {resolve()});
// //                 p.content().then((data) => {
// //                     fs.writeFileSync('index.html', data);
// //                     resolve();
// //                 });
// //
// //             }, 1000);
// //         });
// //     }).then(() => {
// //         b.close();
// //     });
// // })();