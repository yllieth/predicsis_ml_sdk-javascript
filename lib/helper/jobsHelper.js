angular.module('predicsis.jsSDK')
.service('jobsHelper', function($q, Jobs) {
  'use strict';
  var self = this;

  self.listen = function(jobId) {

    var deferred = $q.defer();

    //Lock limiting interval loop to one concurrent request
    var isRequestPending = false;
    //Counter to manage timeout step (3 seconds the 1st minute, one minute after)
    var requestCounter = 0;
    //Store intervalId as a closure to be abble to stop interval loop
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
   * Transform an async promise into the same promise resolving only when job is completed
   *
   * @param {Promise|Array} promise or list of jobs (the last one will be listened)
   * @return {Promise}
   */
  self.wrapAsyncPromise = function(promise) {
    return promise.then(function(asyncResult) {
      var jobId = (asyncResult.job_ids || []).slice(-1)[0];
      return self.listen(jobId)
        .then(function() {
          return asyncResult;
        });
    });
  };
});
