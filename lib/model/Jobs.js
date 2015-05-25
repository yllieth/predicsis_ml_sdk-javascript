/**
 * @ngdoc service
 * @name predicsis.jsSDK.models.Jobs
 * @requires $q
 * @requires Restangular
 * @description
 * <table>
 *   <tr>
 *     <td><span class="badge get">get</span> <kbd>/jobs</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.models.Jobs#methods_all Jobs.all()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge get">get</span> <kbd>/jobs/:id</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.models.Jobs#methods_get Jobs.get()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge delete">delete</span> <kbd>/jobs/:id</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.models.Jobs#methods_delete Jobs.delete()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tfoot>
 *   <tr><td colspan="3">Official documentation is available at https://developer.predicsis.com/doc/v1/job</td></tr>
 *   </tfoot>
 * </table>
 *
 * Output example:
 * <pre>
 * {
 *   id: "53c7ded570632d3417050000",
 *   action: "Generate dictionary",
 *   status: "completed",
 *   error: null,
 *   warnings: null,
 *   created_at: "2014-05-02T15:42:51.687Z",
 *   started_at: "2014-05-02T15:42:52.687Z",
 *   finished_at: "2014-05-02T15:52:51.687Z",
 *   user_id: "5363b25c687964476d000000",
 *   runnable_id: "5363b7fc6879644ae7010000"
 * }
 * </pre>
 *
 * <b>Important notes:</b>
 * A <kbd>GET /gobs/:jobId</kbd> is going to return a <kbd>200 OK</kbd> even if its <kbd>error</kbd> or
 * <kbd>warning</kbd> aren't null! So don't forget to take a look on it!
 */
angular
  .module('predicsis.jsSDK.models')
  .service('Jobs', function($q, Restangular) {
    'use strict';

    function job(id) { return Restangular.one('jobs', id); }
    function jobs() { return Restangular.all('jobs'); }

    // -----------------------------------------------------------------------------------------------------------------

    /**
     * @ngdoc function
     * @name all
     * @methodOf predicsis.jsSDK.models.Jobs
     * @description Get all (or a list of) async job
     * @param {Array} [jobIds] List of job id you want to fetch
     * @return {Object} Promise of a job list
     */
    this.all = function(jobIds) {
      if(jobIds === undefined) {
        return jobs(jobIds).getList();
      } else {
        jobIds = jobIds || [];

        return $q.all(jobIds.map(function(id) {
          return job(id).get();
        }));
      }
    };

    /**
     * @ngdoc function
     * @name get
     * @methodOf predicsis.jsSDK.models.Jobs
     * @description Get a single job by its id
     * @param {String} jobId Job identifier
     * @return {Object} Promise of a job
     */
    this.get = function(jobId) {
      return job(jobId).get();
    };

    /**
     * @ngdoc function
     * @name delete
     * @methodOf predicsis.jsSDK.models.Jobs
     * @description Permanently destroy a specified job
     * @param {String} jobId Id of the job you want to remove
     * @return {Object} Promise of an empty job
     */
    this.delete = function(jobId) {
      return job(jobId).remove();
    };

  });
