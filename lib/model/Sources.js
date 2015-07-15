/**
 * @ngdoc service
 * @name predicsis.jsSDK.models.Sources
 * @requires $q
 * @requires Restangular
 * @description Sources are a representation of an uploaded file on our storage. At time, all uploads are sent to Amazon S3.
 *
 * <table>
 *   <tr>
 *     <td><span class="badge post">post</span> <kbd>/sources</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.models.Sources#methods_create Sources.create()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge get">get</span> <kbd>/sources</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.models.Sources#methods_all Sources.all()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge get">get</span> <kbd>/sources/:id</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.models.Sources#methods_get Sources.get()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge patch">patch</span> <kbd>/sources/:id</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.models.Sources#methods_update Sources.update()}</kbd></td>
 *     <td><span class="badge async">async</span></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge delete">delete</span> <kbd>/sources/:id</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.models.Sources#methods_delete Sources.delete()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tfoot>
 *     <tr><td colspan="3">Official documentation is available at https://developer.predicsis.com/doc/v1/data_management/source/</td></tr>
 *   </tfoot>
 * </table>
 *
 * Output example:
 * <pre>
 * {
 *   id: "54edf76c6170700001860000",
 *   created_at: "2015-02-25T16:25:16.889Z",
 *   updated_at: "2015-02-25T16:25:16.889Z",
 *   name: "hello.csv",
 *   user_id: "541b06dc617070006d060000",
 *   dataset_ids: [],
 *   data_file: {
 *     id: "54edf76c6170700001870000",
 *     filename: "hello.csv",
 *     type: "S3",
 *     size: 24,
 *     url: "https://s3-us-west-2.amazonaws.com/stag.public.kml-api/uploads/541b06dc617070006d060000/sources/1424881474630/hello.csv?AWSAccessKeyId=AKIAIAVVU5KANH5LYROQ&Expires=1425411327&Signature=svmZQCMzgdqzFrbme%2Fy04RzszU0%3D&x-amz-acl=private"
 *   }
 * }
 * </pre>
 */
angular
  .module('predicsis.jsSDK.models')
  .service('Sources', function($q, Restangular) {
    'use strict';

    function source(id) { return Restangular.one('sources', id); }
    function sources() { return Restangular.all('sources'); }

    // -----------------------------------------------------------------------------------------------------------------

    /**
     * @ngdoc function
     * @name create
     * @methodOf predicsis.jsSDK.models.Sources
     * @description Send POST request to the <code>source</code> API resource.
     *
     *  This request is going to create and persist in database a source object regarding to a given uploaded file.
     *  So, you must upload a file first.
     *
     *  You can / must give the following parameters to ask for a source creation:
     *  <pre>
     *  {
     *    name: "Source of dataset.csv"
     *    key:  "path/to/my/file/on/s3/source.csv",
     *  }
     *  </pre>
     *
     *  Both <code>name</code> and <code>key</code> are required.
     *
     * @param {Object} params See above example.
     * @return {Promise} New source
     */
    this.create = function(params) {
      return sources().post({source: params});
    };

    /**
     * @ngdoc function
     * @name all
     * @methodOf predicsis.jsSDK.models.Sources
     * @description Get all (or a list of) generated sources
     * @param {Array} [sourceIds] List of sources' id you want to fetch
     * @return {Promise} A list of sources
     */
    this.all = function(sourceIds) {
      if(sourceIds === undefined) {
        return sources().getList();
      } else {
        sourceIds = sourceIds || [];

        return $q.all(sourceIds.map(function(id) {
          return source(id).get();
        }));
      }
    };

    /**
     * @ngdoc function
     * @name get
     * @methodOf predicsis.jsSDK.models.Sources
     * @description Get a single source by its id
     * @param {String} sourceId Source identifier
     * @return {Promise} A single source
     */
    this.get = function(sourceId) {
      return source(sourceId).get();
    };

    /**
     * @ngdoc function
     * @name update
     * @methodOf predicsis.jsSDK.models.Sources
     * @description Update specified source
     *
     *  You can update the following parameters:
     *  <ul>
     *    <li><code>{String} name</code></li>
     *  </ul>
     *
     * @param {String} sourceId Id of the source you want to update
     * @param {Object} changes see above description to know parameters you are able to update
     * @return {Promise} An updated source
     */
    this.update = function(sourceId, changes) {
      return source(sourceId).patch({source: changes});
    };

    /**
     * @ngdoc function
     * @name delete
     * @methodOf predicsis.jsSDK.models.Sources
     * @description Permanently destroy a specified source
     * @param {String} sourceId Id of the source you want to remove
     * @return {Promise} A removed source
     */
    this.delete = function(sourceId) {
      return source(sourceId).remove();
    };

  });
