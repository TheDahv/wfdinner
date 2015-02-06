var w           = require('when'),
    MongoClient = require('mongodb').MongoClient,
    url = "mongodb://localhost:27017/wfd-dev";

if (process.env.NODE_ENV === 'production' && process.env.MONGOLAB_URI) {
  url = process.env.MONGOLAB_URI;
}

var appDBConn = null;
var conns = MongoClient.connect(url, function (err, db) {
  if (err) {
    console.error("Blow up the app on startup", err.toString());
    process.exit("Failed to connect to db:", err.toString());
  } else {
    appDBConn = db;
  }
});

/**
* @function run
*
* Given a database operation, manage database connections and perform the
* operation for the client
*
* @param {function} cmd Operation function that will be passed a
*   database connection object. It should return a promise that resolves
*   with the result of the operation or rejects with an error
*/
var run = function (cmd) {
  var deferred = w.defer();

  cmd(appDBConn)
    // Consume and end promise chain for DB operation
    // Reject or resolve outer promise with result of inner promise
    .done(
      // success
      function (result) { return deferred.resolve(result); },
      // fail
      function (err) { return deferred.reject(err); }
    );

  return deferred.promise;
};

/** DB Module
 * @module data/db
 *
 * Abstracts away persistence operations. It exports classes to manage
 * the various classes and models in the project
 */
var db = {};

/**
 * Manages operations on the Plan model
 *
 * This particular setup uses the MongoDB implementation for the Plan model
 * and exports its operations here
 */
db.Plan = require('./mongo.plan')(run);
module.exports = db;
