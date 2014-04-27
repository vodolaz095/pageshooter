var hunt = require('hunt'),
  path = require('path'),
  url = require('url'),
  childProcess = require('child_process'),
  request = require('http').request,
  phantomjs = require('phantomjs'),
  Hunt = hunt({
    'io': {
      'loglevel': 0
    },
    'enableMongoose':false,
    'enableMongooseUsers':false,
    'public': __dirname+'/public/',
    'views': __dirname+'/views/',
    'maxWorkers': 2
  });

Hunt.extendApp(function(core){
  core.app.locals.css.push({'href': '//yandex.st/bootstrap/3.1.1/css/bootstrap.min.css', 'media': 'screen'});

  core.app.locals.javascripts.push({'url': '//yandex.st/jquery/2.0.3/jquery.min.js'});
  core.app.locals.javascripts.push({'url':'//yandex.st/bootstrap/3.1.1/js/bootstrap.min.js'});
  core.app.locals.javascripts.push({'url':'//cdnjs.cloudflare.com/ajax/libs/knockout/3.1.0/knockout-min.js'});
  core.app.locals.javascripts.push({'url': '/javascripts/hunt.js'});
});

Hunt.extendRoutes(function(core){
  core.app.get('/', function(request,response){
    response.render('index', {
      'title' : 'PageShooter Application',
      'keywords':'screenshot, url, png, jpg, save, picture',
      'description': 'Make screenshot of every site for free!'
    });
  });
});

Hunt.startCluster({'web': 1});

Hunt.once('start', function(startParameters){
//if application is started as background service, it do not have socket.io support
  if(startParameters.type === 'webserver'){
    Hunt.io.sockets.on('connection', function(socket){
      socket.on('siteshot', function(payload){
//        console.log('siteshot', payload);
        var wtg = payload,
          params = url.parse(wtg),
          binPath = phantomjs.path,
          imageName = path.join(__dirname, 'public', 'results', Hunt.rack()+'.png');

//        console.log(params);

        if(wtg && params.host && params.protocol === 'http:' || params.protocol === 'https:') {
          var childArgs = [
            path.join(__dirname, 'phantomjs.js'),
            params.href,
            imageName
          ];
          socket.emit('siteshotResult', {'locked':false, 'message': 'Waiting for user to stop input...'});
//          console.log('Parsing ', params.href);

          var req = request({'method':'HEAD', 'hostname': params.hostname, 'port': params.port }, function(response){
            if(response.statusCode === 200) {
              socket.emit('siteshotResult', {'locked':true, 'message': 'Trying to parse...'});
              childProcess.execFile(binPath, childArgs, function (err, stdout, stderr) {
                if (err) throw err;
                socket.emit('siteshotResult', {'locked':false, 'url':params.href, 'imageUrl': '/results/'+path.basename(imageName)});
              });
            }
          });
          req.on('error', function(error){
            socket.emit('siteshotResult', {'locked':false, 'url':params.href, 'message':'Error! '+error.toString()});
          });
          req.end();
        } else {
          socket.emit('siteshotResult', {'locked':false, 'message':'Unable to parse Url!', url: params.href});
        }

      });
    });
  }
});

