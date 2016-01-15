/**
 * @ngdoc service
 * @name predicsis.jsSDK.helpers.uploadHelper
 * @requires $rootScope
 * @requires $injector
 * - Uploads
 */
angular
  .module('predicsis.jsSDK.helpers')
  .service('uploadHelper', function($rootScope, $injector) {
    'use strict';

    var tasks = swissknife.tasks;
    var collection = swissknife.collection;
    var HTTP = { CREATED: 201, OK: 200, NOT_FOUND: 404, BAD_REQUEST: 400, FORBIDDEN: 403 };
    var Uploads = $injector.get('Uploads');

    function EventEmitter() {
      var listeners = {};
      this.on = function(event, cb) {
        listeners[event] = (listeners[event] || []).concat([cb]);
        return this;
      };
      this.off = function(event, cb) {
        listeners[event] = (listeners[event] || [])
          .filter(function(listener) { return listener !== cb; });
        return this;
      };
      this.emit = function(event, data) {
        if (listeners[event]) {
          listeners[event].forEach(function(cb) { return cb(data); });
        }
        return this;
      };
      this.addEventListener = this.on;
      this.removeEventListener = this.off;
    }

    function chunks(file, CHUNK_SIZE) {
      var offset = 0;
      var done = false;
      var index = 0;
      var result = {};
      result[Symbol.iterator] = function() {
        return {
          next: function() {
            if (done) {
              return { done: true };
            }
            var chunk = file.slice(offset, offset + CHUNK_SIZE);
            done = chunk.size < CHUNK_SIZE;
            offset += CHUNK_SIZE;
            index++;
            return { done: false, value: { chunk: chunk, index:  index } };
          }
        };
      };
      return result;
    }

    function uploadChunk(chunk, index, id, path) {
      var events = new EventEmitter();
      var cancel = function() {};
      var isCancelled = false;
      var promise = tasks.retry({
        task: tasks.chain([
          function getUploadUrl() {
            return Uploads.getPartUrl(id, index, path);
          },
          function upload(authorization) {
            var result = rehttp.request({ url: authorization.part_url, method: 'PUT', body: chunk });
            cancel = function() { result.cancel(); };
            result.events.on('uploadProgress', function(progress) { events.emit('progress', progress); });
            return result;
          },
          function checkUploadStatus(res) {
            if (res.status !== HTTP.OK) {
              throw res;
            }
            return res;
          }
        ]),
        isRetryable: function(err) {
          // AWS S3 could return 400 after network issues => retyable
          if ([HTTP.NOT_FOUND, HTTP.FORBIDDEN].indexOf(err.status) > -1) {
            return false;
          }
          return isCancelled ? false : true;
        },
        delay: function(cpt) { return cpt * 10000; }
      });
      return Object.assign(promise, { events: events, cancel: function() { isCancelled = true; cancel(); } });
    }

    function upload(file) {
      var chunksProgress = [];
      var chunksCancel = [];
      var events = new EventEmitter();
      var promise = tasks.chain([
        function initializeUpload() {
          return Uploads.initiate();
        },
        function uploadChunks(ctx) {
          var uploadId = ctx.id;
          var uploadPath;
          if (ctx.type === 's3') {
            uploadPath = ctx.key;
          } else if (ctx.type === 'swift') {
            uploadPath = ctx.object;
          }
          var result = collection
            .map(
              chunks(file, 50 * 1024 * 1024),
              function(v) { return uploadChunk(v.chunk, v.index, uploadId, uploadPath); }
            );
          result.events.on('start', function(ctx) {
            chunksProgress[ctx.index] = 0;
            if (ctx.promise && ctx.promise.cancel) {
              chunksCancel[ctx.index] = function() { ctx.promise.cancel(); };
            }
            ctx.promise.events.on('progress', function(progress) {
              chunksProgress[ctx.index] = progress.loaded;
              var progression = chunksProgress.reduce(function(m, v) { return m + v; }, 0) / file.size;
              events.emit('progress', progression * 100);
            });
          });
          result.events.on('end', function(ctx) { delete chunksCancel[ctx.index]; });
          return result.all()
            .then(function() { return { uploadId: uploadId, uploadPath: uploadPath }; });
        },
        function completeUpload(ctx) {
          return Uploads.complete(ctx.uploadId, ctx.uploadPath)
            .then(function() { return { uploadId: ctx.uploadId, uploadPath: ctx.uploadPath, type: ctx.type }; });
        }
      ])();
      return Object.assign(promise, { events: events, cancel: function() {
        chunksCancel.forEach(function(cancel) { cancel(); });
      } });
    }

    var concurrentUploads = {};
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
     *     <td><kbd>path</kbd></td>
     *     <td>
     *       Destination folder of uploaded file.
     *       This value will be required to create the Source resource once the upload finished.
     *       It's initialized to null and updated when upload is initialized
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
     * - the <kbd>path</kbd> parameter of the <kbd>uploadObject</kbd> object is not set
     *
     * @param {Object} file html5 File instance
     */
    this.processFile = function(file) {
      var uploadId = new Date().getTime() + '_' + (file.name || '');
      var uploadRes = upload(file);
      uploadRes.events.on('progress', function(progress) {
        $rootScope.$broadcast('jsSDK.upload.progress', { fileName: file.name, id: uploadId, progression: progress });
      });
      uploadRes.then(function(ctx) {
        delete concurrentUploads[uploadId];
        $rootScope.$broadcast('jsSDK.upload.uploaded', { id: uploadId,  path: ctx.uploadPath, fileName: file.name, type: ctx.type });
      });
      uploadRes.catch(function(err) {
        delete concurrentUploads[uploadId];
        $rootScope.$broadcast('jsSDK.upload.error', { fileName: file.name, id: uploadId, err: err });
      });
      var uploadObject = concurrentUploads[uploadId] = {
        id: uploadId,
        path: null,
        type: null,
        fileName: file.name,
        fileSize: file.size,
        progression: 0,
        isUploading: true,
        created_at: new Date().toISOString(),
        cancelUpload: function() {
          uploadRes.cancel();
          delete concurrentUploads[uploadId];
          $rootScope.$broadcast('jsSDK.upload.cancelled', uploadObject);
        }
      };
      $rootScope.$broadcast('jsSDK.upload.starting', uploadObject);
    };

    /**
     * @ngdoc function
     * @methodOf predicsis.jsSDK.helpers.uploadHelper
     * @name all
     * @description list all currently uploaded datasets
     * @return {Array} List of active upload objects. An active upload has the following properties:
     * <ul>
     *   <li>id</li>
     *   <li>path</li>
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
     *   <li>path</li>
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
