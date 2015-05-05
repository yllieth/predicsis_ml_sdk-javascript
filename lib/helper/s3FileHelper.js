/**
 * @ngdoc service
 * @name predicsis.jsSDK.s3FileHelper
 * @require $injector
 */
angular.module('predicsis.jsSDK')
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
     * @return {Promise}
     */
    this.upload = function(file, progressHandler) {
      var deferred = $q.defer();
      Upload.getCredentials('s3')
        .then(function(credential) {
          var key = credential.key.replace('${filename}', file.name);
          var form = formFactory({
            key: key,
            AWSAccessKeyId: credential.aws_access_key_id,
            'Content-Type': 'multipart/form-data',
            success_action_status: 201,
            acl: 'private',
            'x-amz-meta-filename': file.name,
            policy: credential.policy,
            signature: credential.signature
          }, {
            file: file
          });
          var xhr2 = new XMLHttpRequest();
          xhr2.open('POST', credential.s3_endpoint, true);
          if(progressHandler) {
            xhr2.upload.addEventListener('progress', progressHandler);
          }
          xhr2.addEventListener('loadend', function() {
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
          deferred.resolve({xhr2: xhr2, filename: file.name, key: key});
        });
        return deferred.promise;
    };
  });
