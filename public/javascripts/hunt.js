var
  socket = io(),
  model = {
    'message': ko.observable(),
    'siteshotUrl': ko.observable(),
    'imageUrl': ko.observable(false),
    'locked': ko.observable(false)
  };
model.siteshotUrl.subscribe(function (newUrl) {
  if (newUrl) {
    socket.emit('siteshot', newUrl);
  } else {
    model.message('Enter URL...');
  }
});
socket.on('siteshotResult', function (data) {
  model.locked(data.locked);
  model.message(data.message);
  model.imageUrl(data.imageUrl);
});
ko.applyBindings(model);