var w               = require('when'),
    _               = require('lodash'),
    // Useful for casting plan IDs to MongoIds for queries
    ObjectID        = require('mongodb').ObjectID,
    // The name of the collection/table this module represents
    // Generates the Mongo collection for Plans
    collection      = function (db) { return db.collection('plans'); };

/**
* Mongo/Plan Module
*
* @module data/mongo.plan
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
  * @function findOne
  *
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
   * @function insert
   *
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
          deferred.reject(err);
        } else {
          deferred.resolve(plan);
        }
      });

      return deferred.promise;
    });
  };

  /**
   * @function set
   *
   * Given an id representing a plan object, update the plan at the field specified in
   * `path` with given value
   *
   * @param {string} id The plan document id
   * @param {string} path The key of the element to update in the plan. "dots" are allowed
   *   in the pathname to represent nested keys
   * @param {*} value The value to set to the key
   * @return {Promise} A value-less promise for the successful update, or an error if the update fails
   */
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

  /**
   * @function add
   *
   * Pushes an item into an array in the plan
   *
   * @param {string} id The document ID for a plan
   * @param {string} path The key of the element to update in the plan. "dots" are allowed
   *   in the pathname to represent nested keys
   * @param {*} value The value to add to the array
   * @return {Promise} A value-less promise for the successful update, or an error if the update fails
   */
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

  /**
   * @function remove
   *
   * Pulls an item into an array in the plan. Note that any matching items will
   * be pulled from the array if there are multiple instances of the value.
   *
   * @param {string} id The document ID for a plan
   * @param {string} path The key of the element to update in the plan. "dots" are allowed
   *   in the pathname to represent nested keys
   * @param {*} value The value to pull from the array
   * @return {Promise} A value-less promise for the successful update, or an error if the update fails
   */
  ops.remove = function (id, path, value) {
    return run(function (db) {
      var deferred  = w.defer(),
          query     = { _id: new ObjectID(id) },
          update    = { '$pull': {} },
          pullQuery = {};

      pullQuery[path] = value;
      update['$pull'] = pullQuery;

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

  ops.setEntryField = function (query, update) {
    return run(function (db) {
      var deferred = w.defer();

      if (query._id) {
        query._id = new ObjectID(query._id);
      }

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
