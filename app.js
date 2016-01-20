var
  winston = require('winston'),
  hunt = require('hunt'),
  path = require('path'),
  url = require('url'),
  childProcess = require('child_process'),
  phantomjs = require('phantomjs'),
  Hunt = hunt({
    'io': true,
    'enableMongoose': false,
    'enableMongooseUsers': false,
    'public': __dirname + '/public/',
    'views': __dirname + '/views/',
    'maxWorkers': 2
  });

winston.cli();

Hunt.extendApp(function (core) {
  core.app.locals.delimiters = '[[ ]]';
//load assets
  if (core.config.env === 'production') {
    core.injectJsFromDirectory(['public/dist/dist.min.js']);
    core.injectCssFromDirectory(['public/dist/dist.min.css']);
  } else {
    core.injectJsFromDirectory(['public/dist/vendor.min.js', 'public/javascripts/*.js']);
    core.injectCssFromDirectory(['public/dist/vendor.min.css', 'public/styles/*.css']);
  }
});

Hunt.extendController('/', function (core, router) {
  router.get('/', function (request, response) {
    response.render('index', {
      'title': 'PageShooter Application',
      'keywords': 'screenshot, url, png, jpg, save, picture',
      'description': 'Make screenshot of every site for free!',
      'partials': core.config.env === 'production' ? {
        'adv_left': 'adv_left',
        'adv_right': 'adv_right'
      } : {}
    });
  });
});

Hunt.once('start', function (startParameters) {
//if application is started as background service, it do not have socket.io support
  if (startParameters.type === 'webserver') {
    Hunt.io.sockets.on('connection', function (socket) {
      socket.on('siteshot', function (payload) {
        var
          t,
          tt,
          x = [],
          wtg = payload,
          params = url.parse(wtg),
          binPath = phantomjs.path,
          imageName = path.join(__dirname, 'public', 'results', Hunt.rack() + '.png');

        clearTimeout(t);
        clearInterval(tt);
        if (wtg && params.host && params.protocol === 'http:' || params.protocol === 'https:') {

          var childArgs = [
            path.join(__dirname, 'phantomjs.js'),
            params.href,
            imageName
          ];
          socket.emit('siteshotResult', {
            'locked': false,
            'imageUrl': false,
            'url': params.href,
            'message': 'Waiting for user to stop input...'
          });
          t = setTimeout(function () {
            socket.emit('siteshotResult', {
              'locked': true,
              'imageUrl': false,
              'url': params.href,
              'message': 'Trying to parse ' + params.href,
              'runner': x.join('')
            });
            winston.info('Trying to parse %s', wtg);

            tt = setInterval(function () {
              x.push('.');
              socket.emit('siteshotResult', {
                'locked': true,
                'imageUrl': false,
                'url': params.href,
                'message': 'Trying to parse ' + params.href,
                'runner': x.join('')
              });
            }, 300);

            childProcess.execFile(binPath, childArgs, function (error, stdout, stderr) {
              x = [];
              clearInterval(tt);
              if (error) {
                winston.error('Error parsing %s - %s', wtg, stderr.toString(), error);
                socket.emit('siteshotResult', {
                  'locked': false,
                  'imageUrl': false,
                  'url': params.href,
                  'message': 'Error! ' + error.toString(),
                  'runner':''
                });
              } else {
                winston.info('Success parsing %s', wtg);
                socket.emit('siteshotResult', {
                  'locked': false,
                  'imageUrl': '/results/' + path.basename(imageName),
                  'message':'Screenshot is ready!',
                  'url': params.href,
                  'runner':''
                });
              }
            });
          }, 3000);
        } else {
          socket.emit('siteshotResult', { 'locked': false, 'message': 'Unable to parse Url!', url: '' });
        }
      });
    });
  }
});

Hunt.startCluster({ 'web': 1 });