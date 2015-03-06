/**
 * @ngdoc service
 * @name API.model.Modalities
 * @requires $q
 * @requires apiRestangular
 * @requires jobCompletion
 * @description
 * <table>
 *   <tr>
 *     <td><span class="badge post">post</span> <kbd>/modalities_sets</kbd></td>
 *     <td><kbd>{@link API.model.Modalities#methods_create Modalities.create()}</kbd></td>
 *     <td><span class="badge async">async</span></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge get">get</span> <kbd>/modalities_sets</kbd></td>
 *     <td><kbd>{@link API.model.Modalities#methods_all Modalities.all()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge get">get</span> <kbd>/modalities_sets/:id</kbd></td>
 *     <td><kbd>{@link API.model.Modalities#methods_get Modalities.get()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge delete">delete</span> <kbd>/modalities_sets/:id</kbd></td>
 *     <td><kbd>{@link API.model.Modalities#methods_delete Modalities.delete()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tfoot>
 *     <tr><td colspan="3">Official documentation is available at https://developer.predicsis.com/doc/v1/dictionary/modalities/</td></tr>
 *   </tfoot>
 * </table>
 */
angular.module('API.model')
  .service('Modalities', function($q, apiRestangular, jobCompletion) {

    function modality(id) { return apiRestangular.one('modalities_sets', id); }
    function modalities() { return apiRestangular.all('modalities_sets'); }

    // -----------------------------------------------------------------------------------------------------------------

    /**
     * @ngdoc function
     * @name create
     * @methodOf API.model.Modalities
     * @description Send POST request to the <code>modalities_sets</code> API resource.
     *
     *  You can / must give the following parameters to ask for a modalities set creation:
     *  <pre>
     *  {
     *    variable_id: "5329601c1757f446e6000002"
     *    dataset_id:  "53c7dea470632d3417020000",
     *  }
     *  </pre>
     *
     *  Both <code>variable_id</code> and <code>dataset_id</code> are required.
     *
     * @param {Object} params See above example.
     * @return {Promise} New modalities set
     */
    this.create = function(params) {
      return jobCompletion.wrapAsyncPromise(modalities().post({source: params}));
    };

    /**
     * @ngdoc function
     * @name all
     * @methodOf API.model.Modalities
     * @description Get all (or a list of) generated modalities sets
     * @param {Array} [modalitiesSetIds] List of modalities sets ids you want to fetch
     * @return {Promise} A list of modalities sets
     */
    this.all = function(modalitiesSetIds) {
      if(modalitiesSetIds === undefined) {
        return modalities().getList();
      } else {
        modalitiesSetIds = modalitiesSetIds || [];

        return $q.all(modalitiesSetIds.map(function(id) {
          return modality(id).get();
        }));
      }
    };

    /**
     * @ngdoc function
     * @name get
     * @methodOf API.model.Modalities
     * @description Get a single modalities set by its id
     * @param {String} id Modalities set identifier
     * @return {Promise} A modalities set
     */
    this.get = function(id) {
      return modality(id).get();
    };

    /**
     * @ngdoc function
     * @name delete
     * @methodOf API.model.Modalities
     * @description Permanently destroy a specified source
     * @param {String} id Id of the source you want to remove
     * @return {Promise} A removed source
     */
    this.delete = function(id) {
      return modality(id).remove();
    };

  });
