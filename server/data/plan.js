// The Plan module manages operations on meal plan objects

// Dependencies
var w = require('when');

var planTemplate = {
  _id: '',
  'Monday': {
    'Breakfast' : { name: 'Hello Monday Breakfast', url: '', ingredients: [] },
    'Lunch'     : { name: '', url: '', ingredients: [] },
    'Dinner'    : { name: 'Tacos', url: '', ingredients: [] }
  },
  'Tuesday': {
    'Breakfast' : { name: 'Pancakes', url: '', ingredients: [] },
    'Lunch'     : { name: '', url: '', ingredients: [] },
    'Dinner'    : { name: '', url: '', ingredients: [] }
  },
  'Wednesday': {
    'Breakfast' : { name: '', url: '', ingredients: [] },
    'Lunch'     : { name: '', url: '', ingredients: [] },
    'Dinner'    : { name: '', url: '', ingredients: [] }
  },
  'Thursday': {
    'Breakfast' : { name: '', url: '', ingredients: [] },
    'Lunch'     : { name: '', url: '', ingredients: [] },
    'Dinner'    : { name: '', url: '', ingredients: [] }
  },
  'Friday': {
    'Breakfast' : { name: '', url: '', ingredients: [] },
    'Lunch'     : { name: '', url: '', ingredients: [] },
    'Dinner'    : { name: '', url: '', ingredients: [] }
  },
  'Saturday': {
    'Breakfast' : { name: '', url: '', ingredients: [] },
    'Lunch'     : { name: '', url: '', ingredients: [] },
    'Dinner'    : { name: '', url: '', ingredients: [] }
  },
  'Sunday': {
    'Breakfast' : { name: '', url: '', ingredients: [] },
    'Lunch'     : { name: '', url: '', ingredients: [] },
    'Dinner'    : { name: '', url: '', ingredients: [] }
  }
};

module.exports = exports = {};

/**
* create
*
* Creates a new meal plan
*
* Returns a promise for the resulting object,
* or an error if the creation fails
*/
exports.create = function () {
  var planData,
      deferred = w.defer();

  try {
    planData = Object.create(planTemplate);
    planData._id = '1234';
    deferred.resolve(planData);
  } catch (e) {
    deferred.reject(e);
  }

  return deferred.promise;
};

/**
* get
*
* Given a plan ID, looks up the data for the plan
*
* Returns a promise for the returned plan, or an error if the lookup fails
*/
exports.get = function (id) {
  var planData,
      deferred = w.defer();

  try {
    planData = planTemplate;
    planData._id = id;
    deferred.resolve(planData);
  } catch (e) {
    deferred.reject(e);
  }

  return deferred.promise;
};

/**
* update
*
* Given a plan ID, perform an atomic update for a given item in that plan.
* If an optional `action` parameter is passed, the function will alter its update
* action. Otherwise, the value defaults to "set".
*
* For example, sending "add" or "remove" will push or pull from an array.
*
* Returns a promise for the updated plan data, or an error if the update fails
*/
exports.update = function (id, path, value, action) {
  var planData,
      deferred = w.defer(),
      pathUpdateParts = [],
      i = 0,
      objectTemp;

  try {
    planData = Object.create(planTemplate);
    planData._id = id;
    objectTemp = planData;

    pathUpdateParts = path.split('.');
    for(i; i < pathUpdateParts.length; i++) {
      objectTemp = objectTemp[pathUpdateParts[i]];
    }
    objectTemp = value;

    deferred.resolve(planData);
  } catch (e) {
    deferred.reject(e);
  }

  return deferred.promise;
};
