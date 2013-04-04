var path = require('path');
var fs=require('fs');
exports.index=function(request,response){
    if(request.query['url']){
        var url=request.query['url'];
        var childProcess = require('child_process');
        var phantomjs = require('phantomjs');

        console.log(phantomjs);

        var binPath = phantomjs.path;
        var imgName='temp/img'+(new Date().getTime())+'.png';


        var childArgs = [
            path.join(__dirname, 'phantomjs-script.js'),
            url,
            imgName
        ];

        childProcess.execFile(binPath, childArgs, function(err, stdout, stderr) {
            if(err) throw err;
            response.sendfile(imgName);
            //deleting result afrer we showed it
            setTimeout(function(){
                fs.unlink(imgName, function(err){
                    //if (err) throw err;
                });
            },5000);
        });
    } else {
        response.send('' +
            '<html><title>WHERE DO WE GO TODAY?</title><body>' +
            '<h1>Enter URL</h1>'+
            '<form action="" method="get"><input type="text" name="url" value="http://google.com"><input type="submit" value="Go"></form> ' +
            '</body></html>');
    }
}

