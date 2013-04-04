var path = require('path'),
    fs = require('fs'),
    childProcess = require('child_process'),
    phantomjs = require('phantomjs');


exports.index = function (request, response) {
    if (request.query['url']) {
        var url = request.query['url'];

        var binPath = phantomjs.path;
        var imgName = 'temp/img' + (new Date().getTime()) + '.png';

        var childArgs = [
            path.join(__dirname, 'phantomjs-script.js'),
            url,
            imgName
        ];

        childProcess.execFile(binPath, childArgs, function (err, stdout, stderr) {
            if (err) throw err;
            response.sendfile(imgName);
            //deleting result afrer we showed it
            setTimeout(function () {
                fs.unlink(imgName, function (err) {
                    //if (err) throw err;
                });
            }, 5000);
        });
    } else {
        response.send(
            '<!doctype html><html lang="en"><head><title>WHERE DO WE GO TODAY?</title></head><body>' +
                '<h1>Enter URL</h1>' +
                '<form action="/" method="get"><input type="text" name="url" value="http://google.com?q=sample"><input type="submit" value="Go!"></form> ' +
                '</body></html>');
    }
}

