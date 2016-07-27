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

    function wait(ms) {
      return function (value) {
        return new Promise(function(resolve) {
          setTimeout(function () { resolve(value) }, ms);
        });
      };
    }

    function retry(options) {
      options = options || {};
      options.delay = options.delay || function (cpt) { return 0; }
      options.isRetryable = options.isRetryable || function (err) { return true; }
      options.maxRetry = options.maxRetry || 5;

      var events = new EventEmitter();

      function tryTask(retryCpt) {
        retryCpt = retryCpt || 1;
        var result = options.task(options.ctx);
        events.emit('try', { promise: result, retries: retryCpt });
        return result.catch(function (err) {
           if (options.isRetryable(err) && retryCpt < options.maxRetry) {
             return wait(retryCpt ? options.delay(retryCpt) : 0)()
               .then(function () {
                 return tryTask(retryCpt + 1);
               });
           } else {
             throw err;
           }
         });
      }
      return angular.extend(tryTask(), { events: events });
    }

    function chunks(file, options) {
      var chunks = [];
      var CHUNK_SIZE = options.chunkSize;
      var offset = options.fileOffset || 0;
      var index = parseInt(offset / CHUNK_SIZE, 10);
      while (offset < file.size) {
        index++;
        var chunk = file.slice(offset, offset + CHUNK_SIZE);
        chunks.push({ chunk: chunk, index: index });
        offset += CHUNK_SIZE;
      }
      return chunks;
    }

    function uploadChunk(chunk, index, id, path, events) {
      var cancel = function() {};
      var isCancelled = false;
      var promise = retry({
        task: function () {
          return Uploads.getPartUrl(id, index, path)
            .then(function upload(authorization) {
              var result = rehttp.request({ url: authorization.part_url, method: 'PUT', body: chunk });
              cancel = function() { result.cancel(); };
              result.events.on('uploadProgress', function(progress) { events.emit('progress', { progress: progress, index: index }); });
              return result;
            })
            .then(function checkUploadStatus(res) {
              if (res.status !== HTTP.OK) {
                throw res;
              }
              return res;
            });
        },
        isRetryable: function(err) {
          // AWS S3 could return 400 after network issues => retyable
          if ([HTTP.NOT_FOUND, HTTP.FORBIDDEN].indexOf(err.status) > -1) {
            return false;
          }
          return isCancelled ? false : true;
        },
        delay: function(cpt) { return cpt * 10000; },
        maxRetry: 5
      });
      var promiseMeta = { events: events, cancel: function() { isCancelled = true; cancel(); } };
      events.emit('start', { index: index, cancel: promiseMeta.cancel });
      return angular.extend(promise,  promiseMeta);
    }

    function upload(file, options) {
      var chunkSize = options.chunkSize;
      var uploadId = options.uploadId;
      var uploadPath = options.uploadPath;
      var fileOffset = options.fileOffset || 0;
      var chunksProgress = [fileOffset];
      var chunksCancel = [];
      var events = new EventEmitter();
      var promise = Promise.resolve(function initializeUpload() {
        if (uploadId) {
          return { path: uploadPath, id: uploadId };
        } else {
          return Uploads.initiate()
            .then(function(ctx) {
              if (ctx.type === 's3') {
                ctx.path = ctx.key;
              } else if (ctx.type === 'swift') {
                ctx.path = ctx.object;
              }
              return ctx;
            });
        }
      }());
      promise = promise
        .then(function uploadChunks(ctx) {
          var uploadId = ctx.id;
          var uploadPath = ctx.path;
          var container = ctx.container;
          var type = ctx.type;
          var uploadChunksEvents = new EventEmitter();
          uploadChunksEvents.on('start', function(ctx) {
            chunksProgress[ctx.index] = 0;
            if (ctx.cancel) {
              chunksCancel[ctx.index] = function() { ctx.cancel(); };
            }
            uploadChunksEvents.on('progress', function(ctx) {
              chunksProgress[ctx.index] = ctx.progress.loaded;
              var progression = chunksProgress.reduce(function(m, v) { return m + v; }, 0) / file.size;
              events.emit('progress', progression * 100);
            });
          });
          uploadChunksEvents.on('end', function() {  fileOffset += chunkSize;});
          uploadChunksEvents.on('end', function(ctx) {  delete chunksCancel[ctx.index]; });
          var result = Promise
            .map(
              chunks(file, { chunkSize: chunkSize, fileOffset: fileOffset }),
              function(v) { return uploadChunk(v.chunk, v.index, uploadId, uploadPath, uploadChunksEvents); },
              { concurrency : 3 }
            );
          return result
            .then(function() { return { uploadId: uploadId, uploadPath: uploadPath, container: container, type: type }; });
        })
        .then(function completeUpload(ctx) {
          return retry({
            task: function() {
              return Uploads.complete(ctx.uploadId, ctx.uploadPath)
                .then(function() { return { uploadId: ctx.uploadId, uploadPath: ctx.uploadPath, type: ctx.type, container: ctx.container }; });
            },
            isRetryable: function(err) {
              // AWS S3 could return 400 after network issues => retyable
              if ([HTTP.NOT_FOUND, HTTP.FORBIDDEN].indexOf(err.status) > -1) {
                return false;
              }
              return true;
            },
            delay: function(cpt) { return cpt * 10000; },
            maxRetry: 5
          });
        })
        .catch(function(err) {
          throw { err: err, uploadId: uploadId, uploadPath: uploadPath, fileOffset: fileOffset };
        });
        return angular.extend(promise, { events: events, cancel: function() {
          chunksCancel.forEach(function(cancel) { cancel(); });
        } });
    }

    var concurrentUploads = {};
    /**
     * @ngdoc function
     * @methodOf predicsis.jsSDK.helpers.uploadHelper
     * @name upload
     * @description upload a file
     * You can also resume an upload using optional serverUploadId, fileOffset and uploadPath
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
     * </table>
     *
     * error event does not provide created_at and progression but provides an err attribute
     * this event is fired with a cancel callback as a second argument
     *
     * About the <kbd>jsSDK.upload.starting</kbd> event. As it's fired before sending the
     * upload creation request. So,
     * - you may have a delay between <kbd>jsSDK.upload.starting</kbd> and the first <kbd>jsSDK.upload.progress</kbd> events.
     * - the <kbd>path</kbd> parameter of the <kbd>uploadObject</kbd> object is not set
     *
     * @param {Object} file html5 File instance
     * @param {Object} options
     * @param {Number} options.chunkSize size of each part in Bytes
     * @param {String} options.serverUploadId upload id used by storage server (for resuming upload only)
     * @param {Number} options.fileOffset start uploading file from this offset (Bytes) (for resuming upload only)
     * @param {Number} options.uploadPath path used by the storage server (for resuming upload only)
     */
    this.processFile = function(file, options) {
      var self = this;
      var chunkSize = options.chunkSize || 50 * 1024 * 1024;
      var uploadRes;
      if (options.serverUploadId) {
        uploadRes = upload(file, {
          chunkSize: chunkSize,
          uploadId: options.serverUploadId,
          fileOffset: options.fileOffset,
          uploadPath: options.uploadPath
        });
      } else {
        uploadRes = upload(file, { chunkSize: chunkSize });
      }
      var uploadId = options.uploadId || new Date().getTime() + '_' + (file.name || '');

      uploadRes.events.on('progress', function(progress) {
        $rootScope.$broadcast('jsSDK.upload.progress', { fileName: file.name, id: uploadId, progression: progress });
      });
      uploadRes.then(function(ctx) {
        delete concurrentUploads[uploadId];
        $rootScope.$broadcast('jsSDK.upload.uploaded', { id: uploadId,  path: ctx.uploadPath, fileName: file.name, fileSize: file.size, type: ctx.type, container: ctx.container });
      });
      uploadRes.catch(function(err) {
        //delete concurrentUploads[uploadId];
        $rootScope.$broadcast('jsSDK.upload.error', { fileName: file.name, id: uploadId, err: err, path: err.uploadPath }, function() {
          self.processFile(file, { chunkSize: chunkSize, uploadId: uploadId, serverUploadId: err.uploadId, uploadPath: err.uploadPath, fileOffset: err.fileOffset });
        });
      });
      var uploadObject = concurrentUploads[uploadId] = {
        id: uploadId,
        path: null,
        type: null,
        fileName: file.name,
        fileSize: file.size,
        progression: 0,
        isUploading: true,
        chunkSize: chunkSize,
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
