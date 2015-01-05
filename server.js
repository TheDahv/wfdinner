var express = require('express'),
    app = express(),
    plan = require('./server/data/plan');

// Configure server and middleware
app.use(express.static('./public'));

// Configure routes
app.get('/', function (req, res) {
  require('fs').createReadStream('./welcome.html').pipe(res);
});

app.post('/', function (req, res) {
  var created = plan.create()
  created.done(
    // success
    function (plan) {
      res.redirect('/' + plan._id);
    },
    // failure
    function (err) {
      // TODO: Write plan creation error handler
      console.error("Failed to create plan: ", err);
      res.redirect('/');
    }
  );
});

// Serve up the web app
app.get('/:id', function (req, res) {
  require('fs').createReadStream('./index.html').pipe(res);
});

// Load a meal plan given its ID
app.get('/plans/:id', function (req, res) {
  console.log("/plans/" + req.params.id);
  plan.get(req.params.id).done(
    // success
    function (plan) { res.json(plan); },
    // failure
    function (e) { res.status(500).send({ "error": e }); }
  );
});

// Start up server
var port = process.env.PORT || 3000;
var server = app.listen(port, function () {
  console.log("Server listening at http://%s:%s",
    server.address().address,
    server.address().port);
});
