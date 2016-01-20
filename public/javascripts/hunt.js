var
  tt,
  socket = io(),
  model = {
    'runner': ko.observable(''),
    'message': ko.observable(),
    'siteshotUrl': ko.observable(),
    'imageUrl': ko.observable(false),
    'locked': ko.observable(false)
  };
model.siteshotUrl.subscribe(function (newUrl) {
  if (newUrl) {
    if(tt){
      clearInterval(tt);
    }
    tt = setTimeout(function(){
      socket.emit('siteshot', newUrl);
    }, 1000);
  } else {
    model.message('Enter URL...');
  }
});
ko.applyBindings(model);
socket.on('siteshotResult', function (data) {
  model.runner(data.runner);
  model.locked(data.locked);
  model.message(data.message);
  model.imageUrl(data.imageUrl);
});
