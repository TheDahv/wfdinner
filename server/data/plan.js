// The Plan module manages operations on meal plan objects

// Dependencies
var w = require('when'),
    _ = require('lodash'),
    Plan = require('./db').Plan;

var planTemplate = {
  'Monday': {
    'Breakfast' : { name: 'Hello Monday Breakfast', url: '', ingredients: ['Hello'] },
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
exports.create = function () { return Plan.insert(planTemplate); };

/**
* get
*
* Given a plan ID, looks up the data for the plan
*
* Returns a promise for the returned plan, or an error if the lookup fails
*/
exports.get = Plan.findOne

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
  var operations;

  if (action && _.isArray(value)) {
    switch (action) {
    case 'add':
      operations = value.map(function (ingredient) {
        return Plan.add(id, path, ingredient);
      });
      break;
    case 'remove':
      operations = value.map(function (ingredient) {
        return Plan.remove(id, path, ingredient);
      });
      break;
    default:
      return w.reject(new Error("Unknown update action"));
    }

    return w.all(operations);
  } else {
    // $set a value
    return Plan.update(id, path, value, action);
  }
};
