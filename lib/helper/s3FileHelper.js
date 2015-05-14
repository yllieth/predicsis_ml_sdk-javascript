/**
 * @ngdoc service
 * @name predicsis.jsSDK.s3FileHelper
 * @require $injector
 * - Uploads
 * - $q
 */
angular
  .module('predicsis.jsSDK')
  .service('s3FileHelper', function($injector) {
    'use strict';

    var Upload = $injector.get('Uploads');
    var $q = $injector.get('$q');

    /**
     * @ngdoc function
     * @methodOf predicsis.jsSDK.s3FileHelper
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
    this.upload = function(file, progressHandler) {
      var deferred = $q.defer();
      Upload.getCredentials('s3')
        .then(function(credential) {
          var key = credential.key.replace('${filename}', file.name);
          var xhr2 = new XMLHttpRequest();
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

          if(progressHandler) {
            xhr2.upload.addEventListener('progress', progressHandler);
          }

          xhr2.addEventListener('load', function() {
            if(xhr2.status === 201) {
              deferred.resolve({filename: file.name, key: key});
            } else {
              deferred.reject({status: xhr2.status, err: xhr2.responseText});
            }
          });

          xhr2.addEventListener('error', function(err) {
            deferred.reject(err);
          });

          xhr2.send(form);
        });
        return deferred.promise;
    };
  });
