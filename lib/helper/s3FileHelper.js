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
    this.upload = function(file) {
      var deferred = $q.defer();
      Upload.getCredentials('s3')
        .then(function(credential) {
          var key = credential.key.replace('${filename}', file.name);
          var form = formFactory({
            key: key,
            AWSAccessKeyId: credential.aws_access_key_id,
            'Content-Type': file.type,
            success_action_status: 201,
            acl: 'private',
            'x-amz-meta-filename': file.name,
            policy: credential.policy,
            signature: credential.signature
          }, {
            file: file
          });
          var xhr2 = new XMLHttpRequest();
          xhr2.open('POST', credential.s3_endpoint);
          xhr2.send(form);
          deferred.resolve({xhr2: xhr2, filename: file.name, key: key});
        });
        return deferred.promise;
    };
  });
