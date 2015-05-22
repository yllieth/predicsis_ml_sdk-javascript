/**
 * @ngdoc service
 * @name predicsis.jsSDK.helpers.s3FileHelper
 * @require $injector
 * - Uploads
 * - $q
 */
angular
  .module('predicsis.jsSDK.helpers')
  .service('s3FileHelper', function($injector) {
    'use strict';

    var Upload = $injector.get('Uploads');
    var $q = $injector.get('$q');
    var files = [];
    var progressHandlers = [];
    var requests = [];

    function findFileIndex(file) {
      var index = files.indexOf(file);
      if(index === -1) {
        files.push(file);
        index = files.length - 1;
      }
      return index;
    }

    function progressHandler(fileIndex, evt) {
      if(progressHandlers[fileIndex]) {
        progressHandlers[fileIndex].forEach(function(cb) {
          cb(evt);
        });
      }
    }

    function clean(fileIndex) {
      delete progressHandlers[fileIndex];
      delete files[fileIndex];
      delete requests[fileIndex];
    }

    function abort(file) {
      var fileIndex = findFileIndex(file);
      if(requests[filesIndex]) {
        requests[filesIndex].abort();
      }
    }

    function addProgressListener(file, cb) {
      var fileIndex = findFileIndex(file);
      if(!progressHandlers[fileIndex]) {
        progressHandlers[fileIndex] = [];
      }
      progressHandlers[fileIndex].push(cb);
    }

    /**
     * @ngdoc function
     * @methodOf predicsis.jsSDK.helpers.s3FileHelper
     * @name upload
     * @description upload a file to S3
     *
     * @param {Object} file html5 File instance
     * @return {Promise} Resolved promise my have 2 response whether if upload success or fail:
     * <ul>
     *   <li><b>Success</b> <code>{filename: file.name, key: key}</code></li>
     *   <li><b>Fail</b> <code>{status: xhr2.status, err: xhr2.responseText}</code></li>
     * </ul>
     */
    this.upload = function(file) {
      var fileIndex = findFileIndex(file);
      var deferred = $q.defer();
      Upload.getCredentials('s3')
        .then(function(credential) {
          var key = credential.key.replace('${filename}', file.name);
          var xhr2 = new XMLHttpRequest();
          requests[fileIndex] = xhr2;
          var form = formFactory({
            key: key,
            AWSAccessKeyId: credential.aws_access_key_id,
            'Content-Type': 'multipart/form-data',
            success_action_status: 201,
            acl: 'private',
            policy: credential.policy,
            signature: credential.signature
          }, {
            file: file
          });

          xhr2.open('POST', credential.s3_endpoint, true);
          xhr2.upload.addEventListener('progress', progressHandler.bind(null, fileIndex));

          xhr2.addEventListener('load', function() {
            clean(fileIndex);
            if(xhr2.status === 201) {
              deferred.resolve({filename: file.name, key: key});
            } else {
              deferred.reject({status: xhr2.status, err: xhr2.responseText});
            }
          });

          xhr2.addEventListener('error', function(err) {
            clean(fileIndex);
            deferred.reject(err);
          });

          xhr2.send(form);
        });
        return deferred.promise;
    };

    this.on = function(eventName, file, cb) {
      if(eventName !== 'progress' || !file) {
        throw 'Invalid event name or invalid file';
      }
      addProgressListener(file, cb);
    };

    this.abort = abort;
  });
