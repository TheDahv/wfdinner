var w           = require('when'),
    MongoClient = require('mongodb').MongoClient,
    url = "mongodb://localhost:27017/wfd-dev";

/**
* Given a database operation, manage database connections and perform the
* operation for the client
*
* @param {function} cmd Operation function that will be passed a
*   database connection object. It should return a promise that resolves
*   with the result of the operation or rejects with an error
*/
var run = function (cmd) {
  var deferred = w.defer();

  // Open a database connection
  MongoClient.connect(url, function (err, db) {
    // Report database connection error through the promise chain
    if (err) { return deferred.reject(err); }

    return cmd(db)
      // Ensure connection closes regardless of result outcome
      .finally(function () { db.close(); })
      // Consume and end promise chain for DB operation
      // Reject or resolve outer promise with result of inner promise
      .done(
        // success
        function (result) { deferred.resolve(result); },
        // fail
        function (err) { deferred.reject(err); }
      );
  });

  return deferred.promise;
};

var db = {};
db.Plan = require('./mongo.plan.js')(run);
module.exports = db;
