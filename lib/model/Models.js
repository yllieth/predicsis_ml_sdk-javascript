/**
 * @ngdoc service
 * @name predicsis.jsSDK.Models
 * @requires $q
 * @requires Restangular
 * @requires jobsHelper
 * @description
 * <table>
 *   <tr>
 *     <td><span class="badge post">post</span> <kbd>/models</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.Models#methods_create Models.create()}</kbd></td>
 *     <td><span class="badge async">async</span></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge post">post</span> <kbd>/models</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.Models#methods_create Models.createClassifier()}</kbd></td>
 *     <td><span class="badge async">async</span></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge get">get</span> <kbd>/models</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.Models#methods_all Models.all()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge get">get</span> <kbd>/models/:id</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.Models#methods_get Models.get()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge patch">patch</span> <kbd>/models/:id</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.Models#methods_update Models.update()}</kbd></td>
 *     <td><span class="badge async">async</span></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge delete">delete</span> <kbd>/models/:id</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.Models#methods_delete Models.delete()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tfoot>
 *     <tr><td colspan="3">Official documentation is available at:
 *       <ul>
 *         <li>https://developer.predicsis.com/doc/v1/predictive_models/</li>
 *         <li>https://developer.predicsis.com/doc/v1/predictive_models/classifier/</li>
 *       </ul>
 *     </td></tr>
 *   </tfoot>
 * </table>
 *
 * Output example:
 * <pre>
 *   {
 *     id: "54c25b446170700001a80300",
 *     created_at: "2015-01-23T14:31:32.797Z",
 *     updated_at: "2015-01-23T14:31:34.060Z",
 *     title: "",
 *     type: "classifier",
 *     user_id: "541b06dc617070006d060000",
 *     preparation_rules_set_id: null,
 *     job_ids: [ "54c25b446170700001a90300" ],
 *     model_variables: [
 *       {
 *         name: "Petal Width",
 *         level: 0.669445,
 *         weight: 0.789933,
 *         maximum_a_posteriori: true
 *       },
 *       {
 *         name: "Sepal Length",
 *         level: 0.324718,
 *         weight: 0.415522,
 *         maximum_a_posteriori: false
 *       },
 *       {
 *         name: "Petal Length",
 *         level: 0.625078,
 *         weight: 0.392422,
 *         maximum_a_posteriori: false
 *       },
 *       {
 *         name: "Sepal Width",
 *         level: 0.165768,
 *         weight: 0.343345,
 *         maximum_a_posteriori: false
 *       }
 *     ]
 *   }
 * </pre>
 */
angular.module('predicsis.jsSDK')
  .service('Models', function($q, Restangular, jobsHelper) {
    'use strict';
    var self = this;

    function model(id) { return Restangular.one('models', id); }
    function models() { return Restangular.all('models'); }

    // -----------------------------------------------------------------------------------------------------------------

    /**
     * @ngdoc function
     * @name createClassifier
     * @methodOf predicsis.jsSDK.Models
     * @description Create a new classifier.
     * Simple shortcut for <code>{@link predicsis.jsSDK.Models#method_create Models.create()} function.
     *
     * @param {String} preparationRulesSetId See {@link predicsis.jsSDK.PreparationRules preparation rules} documentation
     * @return {Promise} A new classifier
     */
    this.createClassifier = function(preparationRulesSetId) {
      return self.create({type: 'classifier', preparation_rules_set_id: preparationRulesSetId});
    };

    // -----------------------------------------------------------------------------------------------------------------

    /**
     * @ngdoc function
     * @name create
     * @methodOf predicsis.jsSDK.Models
     * @description Create a model
     *
     *  This request is able to create different types of models:
     *
     *  <ul>
     *    <li>supervised classification:
     *    <pre>
     *      {
     *        type: "classifier",
     *        preparation_rules_set_id: "53fe176070632d0fc5100000"
     *      }
     *    </pre>
     *    </li>
     *  </ul>
     *
     * @param {Object} params See above example.
     * @return {Promise} New model
     */
    this.create = function(params) {
      return jobsHelper.wrapAsyncPromise(models().post({model: params}));
    };

    /**
     * @ngdoc function
     * @name all
     * @methodOf predicsis.jsSDK.Models
     * @description Get all (or a list of) models
     * @param {Array} [modelIds] List of models ids you want to fetch
     * @return {Promise} A list of models
     */
    this.all = function(modelIds) {
      if(modelIds === undefined) {
        return models().getList();
      } else {
        modelIds = modelIds || [];

        return $q.all(modelIds.map(function(id) {
          return model(id).get();
        }));
      }
    };

    /**
     * @ngdoc function
     * @name get
     * @methodOf predicsis.jsSDK.Models
     * @description Get a single model by its id
     * @param {String} id Model identifier
     * @return {Promise} A model
     */
    this.get = function(id) {
      return model(id).get();
    };

    /**
     * @ngdoc function
     * @name update
     * @methodOf predicsis.jsSDK.Models
     * @description Update specified model
     *  You can update the following parameters:
     *  <ul>
     *    <li><code>{String} name</code></li>
     *  </ul>
     *
     * @param {String} id Id of the model you want to update
     * @param {Object} changes see above description to know parameters you are able to update
     * @return {Promise} Updated model
     */
    this.update = function(id, changes) {
      return jobsHelper.wrapAsyncPromise(model(id).patch({model: changes}));
    };

    /**
     * @ngdoc function
     * @name delete
     * @methodOf predicsis.jsSDK.Models
     * @description Permanently destroy a specified model
     * @param {String} id Id of the model you want to remove
     * @return {Promise} A removed model
     */
    this.delete = function(id) {
      return model(id).remove();
    };

  });
