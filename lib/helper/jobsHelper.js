/**
 * @ngdoc service
 * @name predicsis.jsSDK.helpers.jobsHelper
 * @require $q
 * @require Jobs
 *
 * A lot of requests on PredicSis API are asynchronous. That means when you send a <kbd>POST /datasets</kbd>
 * request (for example), you will get a 201 Created HTTP response. A new <kbd>dataset</kbd> has been created.
 * <b>BUT</b> it hasn't been completly fulfilled, there is a pending job you must wait for its termination to
 * consider the <kbd>dataset</kbd> really created.
 *
 * Each time the API returns a <kbd>job_ids</kbd> in a response, the request is asynchronous. This array
 * contains all the jobs created before and the current one in the last position. You have to send a
 * <kbd>GET /jobs/:jobId</kbd> request and check the <kbd>status</kbd> property. It coul take 4 values:
 * <ul>
 *   <li>pending</li>
 *   <li>processing</li>
 *   <li>completed</li>
 *   <li>failed</li>
 * </ul>
 *
 * The following schema shows a job' standard workflow:
 * <img src="https://github.com/PredicSis/kml-api-doc/blob/master/assets/img/job_status.png" alt="Job standard workflow" />
 */
angular
  .module('predicsis.jsSDK.helpers')
  .service('jobsHelper', function($q, Jobs) {
    'use strict';
    var self = this;
    var errorHandler;

    /**
     * @ngdoc function
     * @methodOf predicsis.jsSDK.helpers.jobsHelper
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
    self.listen = function(jobId) {

      var deferred = $q.defer();

      //Lock limiting interval loop to one concurrent request
      var isRequestPending = false;
      //Counter to manage timeout step (3 seconds the 1st minute, one minute after)
      var requestCounter = 0;
      //Store intervalId as a closure to be able to stop interval loop
      var intervalId = window.setInterval(function() {
        //Limit to one concurrent request
        if(!isRequestPending) {

          isRequestPending = true;
          requestCounter++;

          Jobs.get(jobId).then(function(job) {
              //reject promise if status is failed (and stop interval loop)
              if (job.status === 'failed') {
                clearInterval(intervalId);
                var error = new Error(job.error.message);
                error.status = job.error.status;
                deferred.reject(error);
              }
              //resolve promise if status is completed (and stop interval loop)
              else if (job.status === 'completed') {
                clearInterval(intervalId);
                deferred.resolve(jobId);
              }
              //continue interval calls otherwise (wait timeout seconds before accepting new request)
              else {
                //Job is pulled each minute (except 1st minute)
                var timeout = 60;
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
     * @methodOf predicsis.jsSDK.helpers.jobsHelper
     * @name wrapAsyncPromise
     * @description Transform an async promise into the same promise resolving only when job is completed
     *
     * Usage example:
     * <pre>
     * return jobsHelper
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
    self.wrapAsyncPromise = function(promise) {
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
     * @methodOf predicsis.jsSDK.helpers.jobsHelper
     * @name setErrorHandler
     * @description set error handler (errors occuring in a job)
     *
     * Usage example:
     * <pre>
     * return jobsHelper
     *   .setErrorHandler(function(error) {
     *     // do something with error
     *     // ...
     *   });
     * </pre>
     *
     * @param {Function} callback called when an error occurs during a Job
     */
    self.setErrorHandler = function(cb) {
      errorHandler = cb;
    };
});
