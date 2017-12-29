/**
 * Usage:
 * phantomjs grab-colors.js
 *
 * Read:
 * http://phantomjs.org/
 */

var fs = require('fs');
var system = require('system');
var webpage = require('webpage');

var url = system.args[1];
if (!url)
{
    phantom.exit();
}

var page = webpage.create();
page.customHeaders = {
    "User-Agent": "render-server",
};

////////////////////////////////
////////////////////////////////

page.onConsoleMessage = function(msg) {
    console.log(msg);
};
page.open(url, function(status) {
    console.log('Status: '+status);

    var result = page.evaluate(function(){

        var result = ['lala'];

        return result;
    });

    console.dir(result);

    // page.includeJs("http://ajax.googleapis.com/ajax/libs/jquery/1.6.1/jquery.min.js", function() {
    //     var result = page.evaluate(function(){
    //
    //         var result = [];
    //
    //         $('.color-picker').each(function(i, item) {
    //             var itemJq = $(item);
    //
    //             var colorName = itemJq.find('.color-name').text().toUpperCase();
    //             var colorHex = itemJq.find('.hex-number').text();
    //
    //             result.push({
    //                 name: colorName,
    //                 value: colorHex,
    //             });
    //         });
    //
    //         return result;
    //     });
    //
    //
    //     // fs.write(output, strResult, 'w');
    //     // fs.write(outputLess, strResultLess, 'w');
    //     // fs.write(outputPrimitives, strResultLessPrimitives, 'w');
    //     // fs.write(outputPrimitivesF, strResultLessPrimitivesF, 'w');
    //     system.stdout.writeLine('\nHello, system.stdout.writeLine!');
    //
    //     phantom.exit();
    // });
});
