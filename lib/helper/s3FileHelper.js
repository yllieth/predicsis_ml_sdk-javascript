/**
 * @ngdoc service
 * @name predicsis.jsSDK.helpers.s3FileHelper
 * @require $injector
 * - Uploads
 */
angular
  .module('predicsis.jsSDK.helpers')
  .service('s3FileHelper', function($injector) {
    'use strict';

    var Upload = $injector.get('Uploads');
    var files = [];
    var progressHandlers = [];
    var endHandlers = [];
    var errorHandlers = [];
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
        progressHandlers[fileIndex](evt);
      }
    }

    function endHandler(fileIndex, evt) {
      if(endHandlers[fileIndex]) {
        endHandlers[fileIndex](evt);
      }
    }

    function errorHandler(fileIndex, err) {
      if(errorHandlers[fileIndex]) {
        errorHandlers[fileIndex](err);
      }
    }

    function clean(fileIndex) {
      delete progressHandlers[fileIndex];
      delete files[fileIndex];
      delete requests[fileIndex];
    }

    function abort(file) {
      var fileIndex = findFileIndex(file);
      if(requests[fileIndex]) {
        requests[fileIndex].abort();
      }
      clean(fileIndex);
    }

    function addProgressListener(file, cb) {
      var fileIndex = findFileIndex(file);
      progressHandlers[fileIndex] = cb;
    }

    function addEndListener(file, cb) {
      var fileIndex = findFileIndex(file);
      endHandlers[fileIndex] = cb;
    }

    function addErrorListener(file, cb) {
      var fileIndex = findFileIndex(file);
      errorHandlers[fileIndex] = cb;
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
              endHandler(fileIndex, {filename: file.name, key: key});
            } else {
              errorHandler(fileIndex, {status: xhr2.status, err: xhr2.responseText});
            }
          });
          xhr2.addEventListener('error', function(err) {
            clean(fileIndex);
            errorHandler(fileIndex, err);
          });
          xhr2.send(form);
        });
    };

    this.on = function(eventName, file, cb) {
      if((eventName !== 'progress' && eventName !== 'end' && eventName !== 'error') || !file) {
        throw 'Invalid event name or invalid file';
      }
      if(eventName === 'progress') {
        addProgressListener(file, cb);
      } else if (eventName === 'end') {
        addEndListener(file, cb);
      } else {
        addErrorListener(file, cb);
      }
    };

    this.list = function() {
      return files.filter(function(file) {
        return file !== undefined;
      });
    };

    this.abort = abort;
  });
