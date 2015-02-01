var w               = require('when'),
    _               = require('lodash'),
    // Useful for casting plan IDs to MongoIds for queries
    ObjectID        = require('mongodb').ObjectID,
    // The name of the collection/table this module represents
    COLLECTION_NAME = 'plans',
    // Generates the Mongo collection for Plans
    collection      = function (db) { return db.collection(COLLECTION_NAME); };

/**
* Mongo/Plan Module
*
* The MongoDB implementation of our Plan module. This module should
* be initialized with a Database runner function when required. This
* "runner" is responsible for managing the DB connection lifecycle.
*
* Functions in this module define operations on a given database connection
*
* @param {function} run A runner function for each operation defined in the module
*/
module.exports = function (run) {
  var ops = {};

  /**
  * Given a Plan Id, returns a promise for that plan, or an error
  * if there is a failure or the plan is not found
  *
  * @param {string} id The Plan Id
  * @return {Promise} A promise for the result of the database lookup
  */
  ops.findOne = function (id) {
    return run(function (db) {
      var deferred = w.defer();

      collection(db).findOne({ _id: new ObjectID(id) }, function (err, doc) {
        if (err) {
          return deferred.reject(err);
        } else if (_.isEmpty(doc)) {
          return deferred.reject(new Error("Plan not found for ID " + id));
        } else {
          return deferred.resolve(doc);
        }
      });

      return deferred.promise;
    });
  };

  /**
  * Given an object representing a new Plan instance, save it to the database
  * and return a promise for the successfully stored plan, or an error if
  * the insertion fails
  *
  * @param {object} plan The plan data to insert into the database
  * @return {Promise} A promise for the successfully inserted plan or an insertion error
  */
  ops.insert = function (plan) {
    return run(function (db) {
      var deferred = w.defer();

      collection(db).insert(plan, function (err) {
        if (err) {
          return deferred.reject(err);
        } else {
          return deferred.resolve(plan);
        }
      });

      return deferred.promise;
    });
  };

  ops.set = function (id, path, value) {
    return run(function (db) {
      var deferred = w.defer(),
          query    = { _id: new ObjectID(id) },
          update   = { '$set': {} };

      update['$set'][path] = value;

      collection(db).update(query, update, function (err) {
        if (err) {
          return deferred.reject(err);
        } else {
          return deferred.resolve();
        }
      });

      return deferred.promise;
    });
  };

  ops.add = function (id, path, value) {
    return run(function (db) {
      var deferred = w.defer();
          query    = { _id: new ObjectID(id) },
          update   = { '$push': {} };

      update['$push'][path] = value;

      collection(db).update(query, update, function (err) {
        if (err) {
          return deferred.reject(err);
        } else {
          return deferred.resolve();
        }
      });

      return deferred.promise;
    });
  };

  ops.remove = function (id, path, value) {
    return run(function (db) {
      var deferred = w.defer(),
          query    = { _id: new ObjectID(id) },
          update   = { '$pull': {} };

      update['$pull'][path] = value;

      collection(db).update(query, update, function (err) {
        if (err) {
          return deferred.reject(err);
        } else {
          return deferred.resolve();
        }
      });

      return deferred.promise;
    });
  };

  return ops;
};
