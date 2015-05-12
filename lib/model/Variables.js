/**
 * @ngdoc service
 * @name predicsis.jsSDK.Variables
 * @requires $q
 * @requires Restangular
 * @description
 * <table>
 *   <tr>
 *     <td><span class="badge get">get</span> <kbd>/dictionary/:dictionaryId/variables</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.Variables#methods_all Variables.all()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge get">get</span> <kbd>/dictionary/:dictionaryId/variables/:variableId</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.Variables#methods_get Variables.get()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge patch">patch</span> <kbd>/dictionary/:dictionaryId/variables/:variableId</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.Variables#methods_update Variables.update()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tfoot>
 *   <tr><td colspan="3">Official documentation is available at https://developer.predicsis.com/doc/v1/dictionary/variable/</td></tr>
 *   </tfoot>
 * </table>
 *
 * Output example:
 * <pre>
 * {
 *   id: "5492e2a6776f720001000500",
 *   created_at: "2014-12-18T14:20:22.858Z",
 *   updated_at: "2014-12-18T14:20:22.858Z",
 *   name: "Sepal Length",
 *   type: "continuous",
 *   use: true,
 *   description: null,
 *   dictionary_id: "5492e2b1617070000b1d0000",
 *   modalities_set_ids: []
 * }
 * </pre>
 *
 * As a variable cannot live without being attached to a dictionary, all request need a <code>dictionaryId</code>.
 */
angular.module('predicsis.jsSDK')
  .service('Variables', function($q, Restangular) {
    'use strict';

    function variable(dictionaryId, variableId) { return Restangular.one('dictionaries', dictionaryId).one('variables', variableId); }
    function variables(dictionaryId) { return Restangular.one('dictionaries', dictionaryId).all('variables'); }

    // -----------------------------------------------------------------------------------------------------------------

    /**
     * @ngdoc function
     * @name all
     * @methodOf predicsis.jsSDK.Variables
     * @description Get all (or a list of) variables of a specified dictionary
     * @param {String} dictionaryId  Id of the container dictionary
     * @param {Array} [variablesIds] List of variables' id you want to fetch
     * @return {Object} Promise of a variables list
     */
    this.all = function(dictionaryId, variablesIds) {
      if(variablesIds === undefined) {
        return variables(dictionaryId, variablesIds).getList();
      } else {
        variablesIds = variablesIds || [];

        return $q.all(variablesIds.map(function(id) {
          return variable(dictionaryId, id).get();
        }));
      }
    };

    /**
     * @ngdoc function
     * @name get
     * @methodOf predicsis.jsSDK.Variables
     * @description Get a single variable by its id
     * @param {String} dictionaryId Id of the variable you want to fetch
     * @param {String} variableId   Id of the container dictionary
     * @return {Object} Promise of a dictionary
     */
    this.get = function(dictionaryId, variableId) {
      return variable(dictionaryId, variableId).get();
    };

    /**
     * @ngdoc function
     * @name update
     * @methodOf predicsis.jsSDK.Variables
     * @description Update specified variable
     *  You can update the following parameters:
     *  <ul>
     *    <li><code>{Boolean} use</code></li>
     *    <li><code>{String} description</code> (max. 256 characters)</li>
     *    <li><code>{String} type</code> only among the following list: `categorical`, `continuous`</li>
     *  </ul>
     *
     * @param {String} dictionaryId Id of the variable you want to fetch
     * @param {String} variableId   Id of the variable you want to update
     * @param {Object} changes      see above description to know parameters you are able to update
     * @return {Object} Promise of the updated variable
     */
    this.update = function(dictionaryId, variableId,  changes) {
      return variable(dictionaryId, variableId).patch({variable: changes});
    };

  });
