/**
 * @ngdoc service
 * @name predicsis.jsSDK.models.Jobs
 * @requires $q
 * @requires Restangular
 * @description
 * A lot of requests on PredicSis API are asynchronous. That means when you send a <kbd>POST /datasets</kbd>
 * request (for example), you will get a 201 Created HTTP response. A new <kbd>dataset</kbd> has been created.
 * <b>BUT</b> it hasn't been completely fulfilled, there is a pending job you must wait for its termination to
 * consider the <kbd>dataset</kbd> really created.
 *
 * Each time the API returns a <kbd>job_ids</kbd> in a response, the request is asynchronous. This array
 * contains all the jobs created before and the current one in the last position. You have to send a
 * <kbd>GET /jobs/:jobId</kbd> request and check the <kbd>status</kbd> property. It could take 4 values:
 * <ul>
 *   <li>pending</li>
 *   <li>processing</li>
 *   <li>completed</li>
 *   <li>failed</li>
 * </ul>
 *
 * The following schema shows a job' standard workflow:
 * <img src="https://github.com/PredicSis/kml-api-doc/blob/master/assets/img/job_status.png" alt="Job standard workflow" />
 *
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
 *   <tr>
 *     <td>Active pulling on a job waiting for its termination</td>
 *     <td colspan="2"><kbd>{@link predicsis.jsSDK.models.Jobs#methods_listen Jobs.listen()}</kbd></td>
 *   </tr>
 *   <tr>
 *     <td>Transform an async promise into the same promise resolving only when job is completed</td>
 *     <td colspan="2"><kbd>{@link predicsis.jsSDK.models.Jobs#methods_wrapAsyncPromise Jobs.wrapAsyncPromise()}</kbd></td>
 *   </tr>
 *   <tr>
 *     <td>Defines function called when a jobs fails</td>
 *     <td colspan="2"><kbd>{@link predicsis.jsSDK.models.Jobs#methods_setErrorHandler Jobs.setErrorHandler()}</kbd></td>
 *   </tr>
 *   <tfoot>
 *   <tr><td colspan="3">Official documentation is available at https://developer.predicsis.com/doc/v1/job</td></tr>
 *   </tfoot>
 * </table>
 *
 * Output example:
 * <pre>
 *   {
 *     id: "53c7ded570632d3417050000",
 *     action: "Generate dictionary",
 *     status: "completed",
 *     error: null,
 *     warnings: null,
 *     created_at: "2014-05-02T15:42:51.687Z",
 *     started_at: "2014-05-02T15:42:52.687Z",
 *     finished_at: "2014-05-02T15:52:51.687Z",
 *     user_id: "5363b25c687964476d000000",
 *     runnable_id: "5363b7fc6879644ae7010000"
 *   }
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

    var self = this;
    var errorHandler;

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

    // -----------------------------------------------------------------------------------------------------------------

    /**
     * @ngdoc function
     * @methodOf predicsis.jsSDK.models.Jobs
     * @name listen
     * @description Active pulling on a job waiting for its termination
     *
     * <b>Important notes:</b>
     * <ul>
     *   <li>You can <em>listen</em>only one job at a time</li>
     *   <li>a <kbd>GET /jobs/:jobId</kbd> is going to be sent every 3 second the first minute, and every minute after</li>
     * </ul>
     *
     * @param {String} jobId The id of the job api resource you want to wait termination
     * @return {Promise} A promise resolved only when the job succeeds
     */
    this.listen = function(jobId) {

      var deferred = $q.defer();
      var isRequestPending = false;   //Lock limiting interval loop to one concurrent request
      var requestCounter = 0;         //Counter to manage timeout step (3 seconds the 1st minute, one minute after)

      //Store intervalId as a closure to be able to stop interval loop
      var intervalId = window.setInterval(function() {
        //Limit to one concurrent request
        if(!isRequestPending) {

          isRequestPending = true;
          requestCounter++;

          self.get(jobId).then(function(job) {
            if (job.status === 'failed') {
              //reject promise if status is failed (and stop interval loop)
              clearInterval(intervalId);
              var error = new Error(job.error.message);
              error.status = job.error.status;
              deferred.reject(error);

            } else if (job.status === 'completed') {

              //resolve promise if status is completed (and stop interval loop)
              clearInterval(intervalId);
              deferred.resolve(jobId);

            } else {

              //continue interval calls otherwise (wait timeout seconds before accepting new request)
              var timeout = 60;   //Job is pulled each minute (except 1st minute)
              //Job is pulled each 3 seconds during the 1st minute (for fast jobs)
              if(requestCounter < 20) {
                timeout = 3;
              }
              //Unlock request Lock after timeout seconds
              window.setTimeout(function() {
                isRequestPending = false;
              }, timeout * 1000);
            }
          })
            //catch request errors, reject promise and stop interval loop
            .then(null, function(error) {
              clearInterval(intervalId);
              deferred.reject(error);
            });
        }
      }, 1000);

      return deferred.promise;
    };

    /**
     * @ngdoc function
     * @methodOf predicsis.jsSDK.models.Jobs
     * @name wrapAsyncPromise
     * @description Transform an async promise into the same promise resolving only when job is completed
     *
     * Usage example:
     * <pre>
     * return Jobs
     *   .wrapAsyncPromise(datasets().post({dataset: params}))
     *   .then(function(dataset) {
     *     // do something with you completely created new dataset
     *     // ...
     *   });
     * </pre>
     *
     * @param {Promise|Array} promise or list of jobs (the last one will be listened)
     * @return {Promise} See above example
     */
    this.wrapAsyncPromise = function(promise) {
      return promise.then(function(asyncResult) {
        var jobId = (asyncResult.job_ids || []).slice(-1)[0];
        return self.listen(jobId)
          .then(function() {
            return asyncResult;
          })
          .catch(function(err) {
            if(errorHandler) {
              errorHandler(err);
            }
            throw err;
          });
      });
    };

    /**
     * @ngdoc function
     * @methodOf predicsis.jsSDK.models.Jobs
     * @name setErrorHandler
     * @description set error handler (errors occuring in a job)
     *
     * Usage example:
     * <pre>
     * return Jobs
     *   .setErrorHandler(function(error) {
     *     // do something with error
     *     // ...
     *   });
     * </pre>
     *
     * @param {Function} callback called when an error occurs during a Job
     */
    this.setErrorHandler = function(cb) {
      errorHandler = cb;
    };

  });
