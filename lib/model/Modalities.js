/**
 * @ngdoc service
 * @name predicsis.jsSDK.Modalities
 * @requires $q
 * @requires Restangular
 * @requires jobsHelper
 * @description
 * <table>
 *   <tr>
 *     <td><span class="badge post">post</span> <kbd>/modalities_sets</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.Modalities#methods_create Modalities.create()}</kbd></td>
 *     <td><span class="badge async">async</span></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge get">get</span> <kbd>/modalities_sets</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.Modalities#methods_all Modalities.all()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge get">get</span> <kbd>/modalities_sets/:id</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.Modalities#methods_get Modalities.get()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge delete">delete</span> <kbd>/modalities_sets/:id</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.Modalities#methods_delete Modalities.delete()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tfoot>
 *     <tr><td colspan="3">Official documentation is available at https://developer.predicsis.com/doc/v1/dictionary/modalities/</td></tr>
 *   </tfoot>
 * </table>
 */
angular.module('predicsis.jsSDK')
  .service('Modalities', function($q, Restangular, jobsHelper) {

    function modality(id) { return Restangular.one('modalities_sets', id); }
    function modalities() { return Restangular.all('modalities_sets'); }

    // -----------------------------------------------------------------------------------------------------------------

    /**
     * @ngdoc function
     * @name create
     * @methodOf predicsis.jsSDK.Modalities
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
      return jobsHelper.wrapAsyncPromise(modalities().post({source: params}));
    };

    /**
     * @ngdoc function
     * @name all
     * @methodOf predicsis.jsSDK.Modalities
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
     * @methodOf predicsis.jsSDK.Modalities
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
     * @methodOf predicsis.jsSDK.Modalities
     * @description Permanently destroy a specified source
     * @param {String} id Id of the source you want to remove
     * @return {Promise} A removed source
     */
    this.delete = function(id) {
      return modality(id).remove();
    };

  });
