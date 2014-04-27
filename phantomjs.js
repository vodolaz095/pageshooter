var page = require('webpage').create(),
  system = require('system'),
  address = system.args[1],
  output = system.args[2];

page.viewportSize = { 'width': 768, 'height': 1366 };

page.open(address, function (status) {
  if (status !== 'success') {
    console.log('Unable to load the address!');
    phantom.exit(1);
  } else {
    page.render(output);
    phantom.exit();
  }
});
