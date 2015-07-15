/**
 * @ngdoc service
 * @name predicsis.jsSDK.models.Dictionaries
 * @requires $q
 * @requires Restangular
 * @requires Jobs
 * @description
 * <table>
 *   <tr>
 *     <td><span class="badge post">post</span> <kbd>/dictionaries</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.models.Dictionaries#methods_create Dictionaries.create()}</kbd></td>
 *     <td><span class="badge async">async</span></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge post">post</span> <kbd>/dictionaries</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.models.Dictionaries#methods_createFromDataset Dictionaries.createFromDataset()}</kbd></td>
 *     <td><span class="badge async">async</span></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge get">get</span> <kbd>/dictionaries</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.models.Dictionaries#methods_all Dictionaries.all()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge get">get</span> <kbd>/dictionaries/:id</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.models.Dictionaries#methods_get Dictionaries.get()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge patch">patch</span> <kbd>/dictionaries/:id</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.models.Dictionaries#methods_update Dictionaries.update()}</kbd></td>
 *     <td><span class="badge async">async</span></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge delete">delete</span> <kbd>/dictionaries/:id</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.models.Dictionaries#methods_delete Dictionaries.delete()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tfoot>
 *   <tr><td colspan="3">Official documentation is available at https://developer.predicsis.com/doc/v1/dictionary</td></tr>
 *   </tfoot>
 * </table>
 *
 * Output example:
 * <pre>
 * {
 *   id: "5492e2b1617070000b1d0000",
 *   created_at: "2014-12-18T14:20:33.982Z",
 *   updated_at: "2014-12-18T14:20:22.872Z",
 *   name: "dictionary_iris.csv",
 *   description: null,
 *   user_id: "541b06dc617070006d060000",
 *   dataset_id: null,
 *   dataset_ids: [],
 *   variable_ids: [
 *     "5492e2a6776f720001000500",
 *     "5492e2a6776f720001010500",
 *     "5492e2a6776f720001020500",
 *     "5492e2a6776f720001030500",
 *     "5492e2a6776f720001040500"
 *   ],
 *   job_ids: ["5492e2b1617070000b1e0000"]
 * }
 * </pre>
 */
angular
  .module('predicsis.jsSDK.models')
  .service('Dictionaries', function($q, Restangular, Jobs) {
    'use strict';

    function dictionary(id) { return Restangular.one('dictionaries', id); }
    function dictionaries() { return Restangular.all('dictionaries'); }

    // -----------------------------------------------------------------------------------------------------------------

    /**
     * @ngdoc function
     * @name createFromDataset
     * @methodOf predicsis.jsSDK.models.Dictionaries
     * @description Create a dictionary from an existing dataset.
     * @param {Object} dataset We need a dataset to generate a dictionary, and especially the following information:
     * - <code>dataset.name</code> to name the dictionary like: <code>"dictionary_#{name}"</code>
     * - <code>dataset.id</code>
     * @return {Object} Promise of a new dictionary
     */
    this.createFromDataset = function(dataset) {
      return this.create({
        name: encodeURI('dictionary_' + dataset.name.toLowerCase()),
        dataset_id: dataset.id
      });
    };

    //this.clone = function(dictionary) {
    //
    //};

    // -----------------------------------------------------------------------------------------------------------------

    /**
     * @ngdoc function
     * @name create
     * @methodOf predicsis.jsSDK.models.Dictionaries
     * @description Send POST request to the <code>dictionary</code> API resource.
     *  This request is going to generate a dictionary regarding to a given dataset. This generation is delegated to
     *  ML core tool. That's why this request is asynchronous.
     *
     *  You can give the following parameters to ask for dictionary generation:
     *  <pre>
     *  {
     *    dataset_id: "53c7dea470632d3417020000",
     *    name:       "Dictionary of my awesome dataset"
     *  }
     *  </pre>
     *
     * @param {Object} params See above example.
     * @return {Object} Promise of a new dictionary
     */
    this.create = function(params) {
      return Jobs.wrapAsyncPromise(dictionaries().post({dictionary: params}))
        .then(function(result) {
          return dictionary(result.id).get();
        });
    };

    /**
     * @ngdoc function
     * @name all
     * @methodOf predicsis.jsSDK.models.Dictionaries
     * @description Get all (or a list of) generated dictionaries
     * @param {Array} [dictionaryIds] List of dictionaries's id you want to fetch
     * @return {Object} Promise of a dictionaries list
     */
    this.all = function(dictionaryIds) {
      if(dictionaryIds === undefined) {
        return dictionaries(dictionaryIds).getList();
      } else {
        dictionaryIds = dictionaryIds || [];

        return $q.all(dictionaryIds.map(function(id) {
          return dictionary(id).get();
        }));
      }
    };

    /**
     * @ngdoc function
     * @name get
     * @methodOf predicsis.jsSDK.models.Dictionaries
     * @description Get a single dictionary by its id
     * @param {String} dictionaryId Dictionary identifier
     * @return {Object} Promise of a dictionary
     */
    this.get = function(dictionaryId) {
      return dictionary(dictionaryId).get();
    };

    /**
     * @ngdoc function
     * @name update
     * @methodOf predicsis.jsSDK.models.Dictionaries
     * @description Update specified dictionary
     *  You can update the following parameters:
     *  <ul>
     *    <li><code>{String} name</code></li>
     *    <li><code>{String} description</code> (max. 250 characters)</li>
     *  </ul>
     *
     * @param {String} dictionaryId Id of the dictionary you want to update
     * @param {Object} changes see above description to know parameters you are able to update
     * @return {Object} Promise of the updated dictionary
     */
    this.update = function(dictionaryId, changes) {
      return Jobs.wrapAsyncPromise(dictionary(dictionaryId).patch({dictionary: changes}))
        .then(function(result) {
          return dictionary(result.id).get();
        });
    };

    /**
     * @ngdoc function
     * @name delete
     * @methodOf predicsis.jsSDK.models.Dictionaries
     * @description Permanently destroy a specified dictionary
     * @param {String} dictionaryId Id of the dictionary you want to remove
     * @return {Object} Promise of an empty dictionary
     */
    this.delete = function(dictionaryId) {
      return dictionary(dictionaryId).remove();
    };

  });
