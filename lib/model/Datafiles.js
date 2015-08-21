/**
 * @ngdoc service
 * @name predicsis.jsSDK.models.Datafile
 * @requires $q
 * @requires Restangular
 * @description
 *
 * <table>
 *   <tr>
 *     <td><span class="badge get">get</span> <kbd>/data_files</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.models.Datafiles#methods_all Datafiles.all()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge get">get</span> <kbd>/data_files/:id</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.models.Datafiles#methods_get Datafiles.get()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge get">get</span> <kbd>/data_files/:id/signed_url</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.models.Datafiles#methods_get_signed_url Datafiles.getSignedUrl()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge get">get</span> <kbd>/data_files/:id/signed_url</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.models.Datafiles#methods_download Datafiles.download()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tfoot>
 *     <tr><td colspan="3">Official documentation is available at https://developer.predicsis.com/doc/v1/data_management/data_file/</td></tr>
 *   </tfoot>
 * </table>
 *
 * Output example of a <kbd>data_file</kbd>:
 * <pre>
 * {
 *   data_file: {
 *     id: "54edf76c6170700001870000",
 *     filename: "hello.csv",
 *     type: "S3",
 *     size: 24,
 *     signed_url: {
 *       links: {
 *         self: "https://api.predicsis.com/data_files/53c7e7b668796493d3010000/signed_url"
 *       }
  *    }
 *   }
 * }
 * </pre>
 *
 * Output example of a <kbd>signed_url</kbd>:
 * <pre>
 * {
 *   data_file: {
 *     signed_url: "http://prod.kml-api.s3-us-west-2.amazonaws.com/uploads/5347b31750432d45a5020000/sources/1415101671848/source.csv"
 *   }
 * }
 * </pre>
 */
angular
  .module('predicsis.jsSDK.models')
  .service('Datafiles', function($q, Restangular) {
    'use strict';

    function dataFile(id) { return Restangular.one('data_files', id); }
    function dataFiles() { return Restangular.all('data_files'); }

    // -----------------------------------------------------------------------------------------------------------------

    /**
     * @ngdoc function
     * @name all
     * @methodOf predicsis.jsSDK.models.Datafiles
     * @description Get all (or a list of) data files
     * @param {Array} [dataFileIds] List of data files' ids you want to fetch
     * @return {Promise} A list of data_files
     */
    this.all = function(dataFileIds) {
      if(dataFileIds === undefined) {
        return dataFiles().getList();
      } else {
        dataFileIds = dataFileIds || [];

        return $q.all(dataFileIds.map(function(id) {
          return dataFile(id).get();
        }));
      }
    };

    /**
     * @ngdoc function
     * @name get
     * @methodOf predicsis.jsSDK.models.Datafiles
     * @description Get a single data_file by its id
     * @param {String} dataFileId data_file identifier
     * @return {Promise} A single data_file
     */
    this.get = function(dataFileId) {
      return dataFile(dataFileId).get();
    };

    /**
     * @ngdoc function
     * @name getSignedUrl
     * @methodOf predicsis.jsSDK.models.Datafiles
     * @description Get a signed_url of a data_file
     * @param {String} datasetId dataset identifier
     * @return {Promise} A signed url you can download raw file with
     */
    this.getSignedUrl = function(datasetId) {
      return dataFile(datasetId)
        .one('signed_url', null).get()
        .then(function(url) {
          return url.signed_url;
        });
    };

    /**
     * @ngdoc function
     * @name download
     * @methodOf predicsis.jsSDK.models.Datafiles
     * @description Convenience method to concretely download the file
     * @param {String} datasetId dataset identifier
     * @return {Promise} Once the signed url is resolved, we're using <code>window.location.assign</code> to download
     * the file without changing page.
     */
    this.download = function(datasetId) {
      this.getSignedUrl(datasetId).then(function(signedUrl) {
        window.location.assign(signedUrl);
      });
    };

  });
