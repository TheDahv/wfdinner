var express = require('express'),
    app = express();

// Configure server and middleware
app.use(express.static('./public'));

// Configure routes
app.get('/', function (req, res) {
  require('fs').createReadStream('./index.html').pipe(res);
});

// Start up server
var port = process.env.PORT || 3000;
var server = app.listen(port, function () {
  console.log("Server listening at http://%s:%s",
    server.address().address,
    server.address().port);
});
