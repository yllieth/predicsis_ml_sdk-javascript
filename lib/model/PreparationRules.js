/**
 * @ngdoc service
 * @name predicsis.jsSDK.models.PreparationRules
 * @requires $q
 * @requires Restangular
 * @requires Jobs
 * @description
 * <table>
 *   <tr>
 *     <td><span class="badge post">post</span> <kbd>/preparation_rules_sets</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.models.PreparationRules#methods_create PreparationRules.create()}</kbd></td>
 *     <td><span class="badge async">async</span></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge get">get</span> <kbd>/preparation_rules_sets</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.models.PreparationRules#methods_all PreparationRules.all()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge get">get</span> <kbd>/preparation_rules_sets/:id</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.models.PreparationRules#methods_get PreparationRules.get()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge patch">patch</span> <kbd>/preparation_rules_sets/:id</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.models.PreparationRules#methods_update PreparationRules.update()}</kbd></td>
 *     <td><span class="badge async">async</span></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge delete">delete</span> <kbd>/preparation_rules_sets/:id</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.models.PreparationRules#methods_delete PreparationRules.delete()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tfoot>
 *     <tr><td colspan="3">Official documentation is available at https://developer.predicsis.com/doc/v1/preparation_rules/</td></tr>
 *   </tfoot>
 * </table>
 *
 * Output example:
 * <pre>
 *   {
 *     id: "5475d317617070000a300100",
 *     created_at: "2014-11-26T13:18:15.550Z",
 *     updated_at: "2014-11-26T13:18:18.546Z",
 *     name: null,
 *     user_id: "541b06dc617070006d060000",
 *     dataset_id: null,
 *     variable_id: "5475d285776f7200019a0300",
 *     job_ids: [ "5475d317617070000a310100" ]
 *   }
 * </pre>
 */
angular
  .module('predicsis.jsSDK.models')
  .service('PreparationRules', function($q, Restangular, Jobs) {
    'use strict';

    function preparationRulesSet(id) { return Restangular.one('preparation_rules_sets', id); }
    function preparationRulesSets() { return Restangular.all('preparation_rules_sets'); }

    // -----------------------------------------------------------------------------------------------------------------

    /**
     * @ngdoc function
     * @name create
     * @methodOf predicsis.jsSDK.models.PreparationRules
     * @description Create a preparation rules set
     *
     *  You must give the following parameters to create a new preparation rules set:
     *  <pre>
     *  {
     *    dataset_id:  "53c7dea470632d3417020000",
     *    variable_id: "5329601c1757f446e6000002"
     *  }
     *  </pre>
     *
     * @param {Object} params See above example.
     * @return {Promise} New preparation rules set
     */
    this.create = function(params) {
      return Jobs.wrapAsyncPromise(preparationRulesSets().post({preparation_rules_set: params}))
        .then(function(result) {
          return preparationRulesSet(result.id).get();
        });
    };

    /**
     * @ngdoc function
     * @name all
     * @methodOf predicsis.jsSDK.models.PreparationRules
     * @description Get all (or a list of) preparation rules sets
     * @param {Array} [preparationRulesSetIds] List of preparation rules sets ids you want to fetch
     * @return {Promise} A list of preparation rules sets
     */
    this.all = function(preparationRulesSetIds) {
      if(preparationRulesSetIds === undefined) {
        return preparationRulesSets().getList();
      } else {
        preparationRulesSetIds = preparationRulesSetIds || [];

        return $q.all(preparationRulesSetIds.map(function(id) {
          return preparationRulesSet(id).get();
        }));
      }
    };

    /**
     * @ngdoc function
     * @name get
     * @methodOf predicsis.jsSDK.models.PreparationRules
     * @description Get a single preparation rules set by its id
     * @param {String} id Preparation rules set identifier
     * @return {Promise} A preparation rules set
     */
    this.get = function(id) {
      return preparationRulesSet(id).get();
    };

    /**
     * @ngdoc function
     * @name update
     * @methodOf predicsis.jsSDK.models.PreparationRules
     * @description Update specified preparation rules set
     *  You can update the following parameters:
     *  <ul>
     *    <li><code>{String} name</code></li>
     *  </ul>
     *
     * @param {String} id Id of the preparation rules set you want to update
     * @param {Object} changes see above description to know parameters you are able to update
     * @return {Promise} Updated preparation rules set
     */
    this.update = function(id, changes) {
      return Jobs.wrapAsyncPromise(preparationRulesSet(id).patch({preparation_rules_set: changes}))
        .then(function(result) {
          return preparationRulesSet(result.id).get();
        });
    };

    /**
     * @ngdoc function
     * @name delete
     * @methodOf predicsis.jsSDK.models.PreparationRules
     * @description Permanently destroy a specified preparation rules set
     * @param {String} id Id of the preparation rules set you want to remove
     * @return {Promise} A removed preparation rules set
     */
    this.delete = function(id) {
      return preparationRulesSet(id).remove();
    };

  });
