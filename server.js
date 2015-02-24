var express = require('express'),
    _     = require('lodash'),
    app     = express(),
    sockets = require('socket.io'),
    io,
    plan    = require('./server/data/plan'),
    w       = require('when');

// Configure server and middleware
app.use(express.static('./public'));

// Configure routes
app.get('/', function (req, res) {
  require('fs').createReadStream('./index.html').pipe(res);
});

app.post('/', function (req, res) {
  var created = plan.create();
  created.done(
    // success
    function (plan) {
      res.end(JSON.stringify(plan));
    },
    // failure
    function (err) {
      // TODO: Write plan creation error handler
      console.error(err);
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
    function (p) { res.json(p); },
    // failure
    function (e) {
      var errorPayload = { "error": e.toString() };
      console.error(e.toString());
      if (/not found/.test(errorPayload.error)) {
        res.status(404).send(errorPayload)
      } else {
        res.status(500).send(errorPayload);
      }
    }
  );
});

// Start up server
var port = process.env.PORT || 3000;
var server = app.listen(port, function () {
  console.log("Server listening at http://%s:%s",
    server.address().address,
    server.address().port);
});

// socket setup
io = sockets(server);
io.on('connection', function (socket) {
  // Assign this socket to a room
  socket.on('room:join', function (roomId) {
    console.log("Connection trying to join room", roomId);
    socket.join(roomId);
  });

  socket.on('mealchange', function (data) {
    var result = plan.update(
      data.id,
      data.path.replace(/:/g, '.'),
      data.value
    );

    result.done(
      // success
      function () {
        // Send back to all listeners
        io.to(data.id).emit('mealupdate', data);
      },
      // fail
      function (err) {
        console.error("Update error: ", err);
        socket.emit('err:update', _.extend(data, { err: err }));
      }
    );
  });

  socket.on('ingredientschange', function (data) {
    var result = plan.update(
      data.id,
      data.path.replace(/:/g, '.'),
      data.ingredients,
      data.action
    );

    result.done(
      // success
      function () {
        // Send back to all listeners
        io.to(data.id).emit('ingredientsupdate', data);
      },
      // fail
      function (err) {
        console.error("Update error: ", err);
        socket.emit('err:update', _.extend(data, { err: err }));
      }
    );
  });
});
