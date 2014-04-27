var socket = io.connect('', {
  'connect timeout': 1000
});

var model = {
  'message': ko.observable(),
  'siteshotUrl': ko.observable(),
  'imageUrl': ko.observable(false),
  'locked': ko.observable(false),
}

model.siteshotUrl.subscribe(function(newUrl){
  if(newUrl){
    socket.emit('siteshot', newUrl);
  } else {
    model.message('Enter URL...');
  }
});

ko.applyBindings(model);

socket.on('siteshotResult', function(data){
  model.locked(data.locked);
  model.message(data.message);
  model.imageUrl(data.imageUrl);
});