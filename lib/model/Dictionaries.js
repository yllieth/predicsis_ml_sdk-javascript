/**
 * @ngdoc service
 * @name API.model.Dictionaries
 * @requires $q
 * @requires apiRestangular
 * @requires jobCompletion
 * @description
 * <table>
 *   <tr>
 *     <td><span class="badge post">post</span> <kbd>/dictionaries</kbd></td>
 *     <td><kbd>{@link API.model.Dictionaries#methods_create Dictionaries.create()}</kbd></td>
 *     <td><span class="badge async">async</span></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge post">post</span> <kbd>/dictionaries</kbd></td>
 *     <td><kbd>{@link API.model.Dictionaries#methods_createFromDataset Dictionaries.createFromDataset()}</kbd></td>
 *     <td><span class="badge async">async</span></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge get">get</span> <kbd>/dictionaries</kbd></td>
 *     <td><kbd>{@link API.model.Dictionaries#methods_all Dictionaries.all()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge get">get</span> <kbd>/dictionaries/:id</kbd></td>
 *     <td><kbd>{@link API.model.Dictionaries#methods_get Dictionaries.get()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge patch">patch</span> <kbd>/dictionaries/:id</kbd></td>
 *     <td><kbd>{@link API.model.Dictionaries#methods_update Dictionaries.update()}</kbd></td>
 *     <td><span class="badge async">async</span></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge delete">delete</span> <kbd>/dictionaries/:id</kbd></td>
 *     <td><kbd>{@link API.model.Dictionaries#methods_delete Dictionaries.delete()}</kbd></td>
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
angular.module('API.model')
  .service('Dictionaries', function($q, apiRestangular, jobCompletion) {

    function dictionary(id) { return apiRestangular.one('dictionaries', id); }
    function dictionaries() { return apiRestangular.all('dictionaries'); }

    // -----------------------------------------------------------------------------------------------------------------

    /**
     * @ngdoc function
     * @name createFromDataset
     * @methodOf API.model.Dictionaries
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
     * @methodOf API.model.Dictionaries
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
      return jobCompletion.wrapAsyncPromise(dictionaries().post({dictionary: params}));
    };

    /**
     * @ngdoc function
     * @name all
     * @methodOf API.model.Dictionaries
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
     * @methodOf API.model.Dictionaries
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
     * @methodOf API.model.Dictionaries
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
      return jobCompletion.wrapAsyncPromise(dictionary(dictionaryId).patch({dictionary: changes}));
    };

    /**
     * @ngdoc function
     * @name delete
     * @methodOf API.model.Dictionaries
     * @description Permanently destroy a specified dictionary
     * @param {String} dictionaryId Id of the dictionary you want to remove
     * @return {Object} Promise of an empty dictionary
     */
    this.delete = function(dictionaryId) {
      return dictionary(dictionaryId).remove();
    };

  });
