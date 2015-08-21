/**
 * @ngdoc service
 * @name predicsis.jsSDK.helpers.uploadHelper
 * @requires $rootScope
 * @requires $injector
 * - Sources
 */
angular
  .module('predicsis.jsSDK.helpers')
  .service('uploadHelper', function($rootScope, $injector) {
    'use strict';

    var HTTP = { CREATED: 201 };
    var concurrentUploads = {};
    var Sources = $injector.get('Sources');

    function getKey(credential, filename) {
      return credential.key.replace('${filename}', filename);
    }

    function upload(uploadObject, xhr2, credential, file) {
      var headers = {
        key: getKey(credential, file.name),
        AWSAccessKeyId: credential.aws_access_key_id,
        'Content-Type': 'multipart/form-data',
        success_action_status: HTTP.CREATED,
        acl: 'private',
        policy: credential.policy,
        signature: credential.signature
      };
      var content = { file: file };
      var form = formFactory(headers, content);

      xhr2.open('POST', credential.s3_endpoint, true);

      xhr2.upload.addEventListener('progress', function(event) {
        uploadObject.progression = parseInt(event.loaded / event.total * 100);
        uploadObject.isUploading = true;

        $rootScope.$broadcast('jsSDK.upload.progress', uploadObject);
      });

      xhr2.addEventListener('load', function() {
        delete concurrentUploads[uploadObject.id];
        uploadObject.isUploading = false;

        if(xhr2.status === HTTP.CREATED) {
          $rootScope.$broadcast('jsSDK.upload.uploaded', uploadObject);
        } else {
          $rootScope.$broadcast('jsSDK.upload.error', { upload: uploadObject, request: xhr2 });
        }
      });

      xhr2.addEventListener('error', function() {
        delete concurrentUploads[uploadObject.id];
        uploadObject.isUploading = false;
        $rootScope.$broadcast('jsSDK.upload.error', { upload: uploadObject, request: xhr2 });
      });

      xhr2.send(form);
    }

    /**
     * @ngdoc function
     * @methodOf predicsis.jsSDK.helpers.uploadHelper
     * @name upload
     * @description upload a file
     * The upload method raises the following events during the upload process:
     * <ul>
     *   <li><kbd>jsSDK.upload.starting</kbd></li>
     *   <li><kbd>jsSDK.upload.progress</kbd></li>
     *   <li><kbd>jsSDK.upload.uploaded</kbd></li>
     *   <li><kbd>jsSDK.upload.cancelled</kbd></li>
     *   <li><kbd>jsSDK.upload.error</kbd></li>
     *   <li><kbd></kbd></li>
     * </ul>
     *
     * Each of these events is emitted with an <code>upload</code> object which contains details:
     * <table>
     *   <tr>
     *     <td><kbd>id</kbd></td>
     *     <td>Concatenation of a timestamp and uploaded file name</td>
     *   </tr>
     *   <tr>
     *     <td><kbd>key</kbd></td>
     *     <td>
     *       Destination folder of uploaded file.
     *       This value will be required to create the Source resource once the upload finished.
     *       It's initialized to null and updated when the GET /sources/credentials/s3 request is resolved.
     *     </td>
     *   </tr>
     *   <tr>
     *     <td><kbd>fileName</kbd></td>
     *     <td>Uploaded file's name given by FileAPI</td>
     *   </tr>
     *   <tr>
     *     <td><kbd>fileSize</kbd></td>
     *     <td>Uploaded file's size given by FileAPI</td>
     *   </tr>
     *   <tr>
     *     <td><kbd>progression</kbd></td>
     *     <td>A number ([0..100]) internally updated on each <kbd>progress</kbd> event</td>
     *   </tr>
     *   <tr>
     *     <td><kbd>isUploading</kbd></td>
     *     <td>A boolean indicating if the upload process is still running</td>
     *   </tr>
     *   <tr>
     *     <td><kbd>created_at</kbd></td>
     *     <td>A timestamp in ISO format like <kbd>2014-05-02T15:27:37.687Z</kbd></td>
     *   </tr>
     *   <tr>
     *     <td><kbd>cancelUpload</kbd></td>
     *     <td>A function which will stop the upload by aborting the request</td>
     *   </tr>
     * </table>
     *
     * About the <kbd>jsSDK.upload.starting</kbd> event. As it's fired before sending the
     * "Get credential" request. So,
     * - you may have a delay between <kbd>jsSDK.upload.starting</kbd> and the first <kbd>jsSDK.upload.progress</kbd> events.
     * - the <kbd>key</kbd> parameter of the <kbd>uploadObject</kbd> object is not set
     *
     * The upload is performed through a XMLHttpRequest, and all details about endpoint, security,
     * destination folder is handled by the API and its <code>Sources.getCredentials</code> request.
     *
     * @param {Object} file html5 File instance
     * @param {String=s3} storageService Name of PredicSis' storage service.
     *                                   The API only accepts one of the following values: s3.
     */
    this.processFile = function(file, storageService) {
      storageService = storageService || 's3';

      var xhr2 = new XMLHttpRequest();
      var uploadId =  new Date().getTime() + '_' + (file.name || '');
      var uploadObject = concurrentUploads[uploadId] = {
        id: uploadId,
        key: null,
        fileName: file.name,
        fileSize: file.size,
        progression: 0,
        isUploading: true,
        created_at: new Date().toISOString(),
        cancelUpload: function() {
          xhr2.abort();
          delete concurrentUploads[uploadId];
          $rootScope.$broadcast('jsSDK.upload.cancelled', uploadObject);
        }
      };

      $rootScope.$broadcast('jsSDK.upload.starting', uploadObject);

      Sources
        .getCredentials(storageService)
        .then(function(credentials) {
          uploadObject.key = getKey(credentials, file.name);
          upload(uploadObject, xhr2, credentials, file);
        });
    };

    /**
     * @ngdoc function
     * @methodOf predicsis.jsSDK.helpers.uploadHelper
     * @name all
     * @description list all currently uploaded datasets
     * @return {Array} List of active upload objects. An active upload has the following properties:
     * <ul>
     *   <li>id</li>
     *   <li>key</li>
     *   <li>fileName</li>
     *   <li>fileSize</li>
     *   <li>progression</li>
     *   <li>isUploading</li>
     *   <li>created_at</li>
     *   <li>cancelUpload</li>
     * </ul>
     */
    this.all = function() {
      return Object.keys(concurrentUploads).map(function(key) {
        return concurrentUploads[key];
      });
    };

    /**
     * @ngdoc function
     * @methodOf predicsis.jsSDK.helpers.uploadHelper
     * @name get
     * @description get an active upload
     * @param {String} uploadId An upload identifier looks like <timestamp>_<filename>
     * @return {Object} An upload object with the following properties:
     * <ul>
     *   <li>id</li>
     *   <li>key</li>
     *   <li>fileName</li>
     *   <li>fileSize</li>
     *   <li>progression</li>
     *   <li>isUploading</li>
     *   <li>created_at</li>
     *   <li>cancelUpload</li>
     * </ul>
     */
    this.get = function(uploadId) {
      return concurrentUploads[uploadId];
    };

    /**
     * @ngdoc function
     * @methodOf predicsis.jsSDK.helpers.uploadHelper
     * @name cancel
     * @description Abort a single upload
     * @param {String} uploadId Id of the upload to stop
     */
    this.cancel = function(uploadId) {
      this.get(uploadId).cancelUpload();
    };
  });
