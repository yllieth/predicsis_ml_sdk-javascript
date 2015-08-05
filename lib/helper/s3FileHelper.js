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
    var errorManager = $injector.get('errorManager');
    var datasetsById = {};

    // Prevent window unload during upload
    window.onbeforeunload = function (e) {
      e = e || window.event || {};
      if(Object.keys(datasetsById).length) {
        e.returnValue = 'Datasets are currently uploading. If you close this window, upload would be cancelled';
        return e.returnValue;
      }
    };

    function getKey(credential, filename) {
      return credential.key.replace('${filename}', filename);
    }

    function createForm(credential, file) {
      var key = getKey(credential, file.name);
      return formFactory({
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
    }

    function generateId(file) {
      return (file.name || '') + new Date().getTime();
    }
    /**
     * @ngdoc function
     * @methodOf predicsis.jsSDK.helpers.s3FileHelper
     * @name upload
     * @description upload a file to S3
     *
     * @param {Object} file html5 File instance
     * @return {EventEmitter}
     * <ul>
     *   <li><b>cancelled</b> <code>datasetId</code></li>
     *   <li><b>started</b> <code>dataset (Object)</code></li>
     *   <li><b>uploaded</b> <code>{filename: file.name, key: key, dataset: Object}</code></li>
     *   <li><b>error</b> <code>{status: xhr2.status, err: xhr2.responseText, id: dataset.id}</code></li>
     *   <li><b>progress</b> <code>dataset(Object)</code></li>
     * </ul>
     */
    this.upload = function(file, params) {
      var name = params.name || file.name;
      var emitter = new EventEmitter();
      var xhr2 = new XMLHttpRequest();
      var datasetId = generateId(file);
      var dataset = datasetsById[datasetId] = {
        id: datasetId,
        name: name,
        uploaded: 0,
        isUploading: true,
        data_file: {
          size: file.size,
          filename: file.name
        },
        source_ids: [],
        children_dataset_ids: [],
        cancelUpload: function() {
          xhr2.abort();
          delete datasetsById[datasetId];
          emitter.emit('cancelled', datasetId);
        }
      };
      emitter.emit('started', dataset);
      Upload.getCredentials('s3')
        .then(function(credential) {
          var form = createForm(credential, file);
          xhr2.open('POST', credential.s3_endpoint, true);
          xhr2.upload.addEventListener('progress', function(evt) {
            dataset.uploaded = parseInt(evt.loaded / evt.total * 100);
            // Asynchronous call to be sure to not be inside an angular digest cycle
            // https://docs.angularjs.org/error/$rootScope/inprog?p0=$apply
            setTimeout(emitter.emit.bind(emitter, 'progress', dataset), 0);
          });
          xhr2.addEventListener('load', function() {
            delete datasetsById[datasetId];
            if(xhr2.status === 201) {
              emitter.emit('uploaded', {filename: file.name, key: getKey(credential, file.name), dataset: dataset});
            } else {
              emitter.emit('error', {status: xhr2.status, err: xhr2.responseText, id: dataset.id });
              errorManager.handleApplicationError({
                text: 'File upload failed',
                type: 'alert',
                code: 'APP-' + xhr2.status + '001',
                action: 'Upload file'
              });
            }
          });
          xhr2.addEventListener('error', function(err) {
            emitter.emit('error', {status: 0, err: err.target.status, id: dataset.id });
            errorManager.handleApplicationError({
              text: 'File upload failed',
              type: 'alert',
              code: 'APP-' + err.target.status + '002',
              action: 'Upload file'
            });
          });
          xhr2.send(form);
        });
        return emitter
    };

    /**
     * @ngdoc function
     * @methodOf predicsis.jsSDK.helpers.s3FileHelper
     * @name list
     * @description list all currently uploaded datasets
     *
     * @return {Array}
     */
    this.list = function() {
      return Object.keys(datasetsById).map(function(key) {
        return datasetsById[key];
      });
    };

    /**
     * @ngdoc function
     * @methodOf predicsis.jsSDK.helpers.s3FileHelper
     * @name list
     * @description list all currently uploaded datasets
     *
     * @param {String} datasetId Id of the dataset to stop upload
     * @return {Array}
     */
    this.cancel = function(datasetId) {
      datasetsById[datasetId].cancelUpload();
    };
  });
