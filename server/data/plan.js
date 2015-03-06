// Dependencies
var w                  = require('when'),
    _                  = require('lodash'),
    Plan               = require('./db').Plan,
    knownUpdateActions = new RegExp(['add', 'remove', 'set'].join('|'));

var planTemplate =
  'Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday'.split(',').reduce(
    function (progress, day) {
      progress[day] = ['Breakfast', 'Lunch', 'Dinner'].reduce(
        function (mealObject, meal) {
          mealObject[meal] = { name: '', url: '', ingredients: [] };
          return mealObject;
        }, {});
      return progress;
    }, {});

/**
 * Plan module
 *
 * @module plan
 *
 * Abstract module managing Plan operations and delegating calls to
 * persistence layer implementations.
 */
module.exports = exports = {};

/**
* @function create
*
* Creates a new meal plan
*
* @return A promise for the resulting object, or an error if the creation fails
*/
exports.create = function () {
  return Plan.insert(_.clone(planTemplate));
};

/**
* @function get
*
* Given a plan ID, looks up the data for the plan
*
* @param {string} id The document ID for a plan
* @return {Promise} A promise for the returned plan, or an error if the lookup fails
*/
exports.get = Plan.findOne

/**
* @function update
*
* Given a plan ID, perform an atomic update for a given item in that plan.
* If an optional `action` parameter is passed, the function will alter its update
* action. Otherwise, the value defaults to "set".
*
* For example, sending "add" or "remove" will push or pull from an array.
*
* @param {string} id The document ID for a plan
* @param {string} path The key of the element to update in the plan. "dots" are allowed
*   in the pathname to represent nested keys
* @param {*|*[]} value The value to set to the key. If the value is an array
*   of values, and the function will split each into an atomic operation and perform them all
* @param {string} [action=set] Defines the database action to perform.
*   Can be ['add'|'remove'|'set']. Defaults to 'set'
* @return {Promise} A value-less promise for the successful update, or an error if the update fails
*/
exports.update = function (id, path, value, action) {
  // Default action to set
  action = action || 'set';

  if (!knownUpdateActions.test(action)) {
    return w.reject(new Error("Unknown update action " + action));
  } else if (_.isArray(value)) {
    // Fail all if one item operation fails. Otherwise, return a promise
    // representing the cumulative successful resolution of all item-updates
    return w.all(
      value.map(function (ingredient) {
        return Plan[action](id, path, ingredient);
      })
    );
  } else {
    return Plan[action](id, path, value);
  }
};
