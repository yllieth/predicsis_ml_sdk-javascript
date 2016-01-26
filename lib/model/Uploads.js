/**
 * @ngdoc service
 * @name predicsis.jsSDK.models.Uploads
 * @requires Restangular
 * @description
 * <table>
 *   <tr>
 *     <td><span class="badge post">post</span> <kbd>/uploads</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.models.Uploads#methods_initiate Uploads.initiate()}</kbd></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge get">get</span> <kbd>/uploads/:id</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.models.Uploads#methods_getPartUrl Uploads.getPartUrl()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge patch">patch</span> <kbd>/uploads/:id</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.models.Uploads#methods_complete Uploads.complete()}</kbd></td>
 *   </tr>
 * </table>
 *
 * Output example:
 * <pre>
 *   {
 *    "type": "s3",
 *    "id": "NTVkYzg4NmY0ZDYxNjM5MGQ4MDAwMDAwcjJjODMub0JBQTZ2UVRCWGNUcjZmMlFQ=,
 *    "bucket": "bucketName",
 *    "key": "uploads/55dc886f4d616390d8000000/sources/1453395950000/source.txt"
 *   }
 * </pre>
 * <pre>
 *   {
 *    "type": "s3",
 *    "id": "NTVkYzg4NmY0ZDYxNjM5MGQ4MDAwMDAwcjJjODMub0JBQTZ2UVRCWGNUcjZmMlFQ=",
 *    "part_url": "https://bucketName.s3-us-west-2.amazonaws.com/uploads/55dc886f4d616390d8000000/sources/1453456937000/source.txt?partNumber=1&uploadId=ZGYksTwrSxCpVrIhyb_EYrs1KmeLlPPB5DpjtIPLHdmfTAKiYachywEiq.roLFRp7PaFlJFy_ESG42CyWVRhMpJiJAbbPlBH6rjRbIGtMfvxR7WR.mpdpWYCsyVpaF_U&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAJ2BNZXXTAR2ZTDIA%2F20160122%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20160122T100359Z&X-Amz-Expires=900&X-Amz-SignedHeaders=host&X-Amz-Signature=mffdd8979b970dfd28224142ecef5c9f5bcb2600510e64bfdd7463e17e0df793",
 *    "bucket": "bucketName",
 *    "key": "uploads/55dc886f4d616390d8000000/sources/1453456937000/source.txt"
 *   }
 * </pre>
 */
angular
  .module('predicsis.jsSDK.models')
  .service('Uploads', function(Restangular) {
    'use strict';

    function upload(id) { return Restangular.one('uploads', id); }
    function uploads() { return Restangular.all('uploads'); }

    /**
     * @ngdoc function
     * @name initiate
     * @methodOf predicsis.jsSDK.models.Uploads
     * @description initiate a multipart upload
     *
     * This initialize a multipart upload
     *
     * @return {Promise} New upload
     */
    this.initiate = function() {
      return uploads().post({});
    };

    /**
     * @ngdoc function
     * @name get
     * @methodOf predicsis.jsSDK.models.Uploads
     * @description Get a presigned url to upload a part
     * @param {String} id Model identifier
     * @param {Number} partNumber
     * @param {String} path
     * @return {Promise} An object containing a part_url field (PUT part presigned url)
     */
    this.getPartUrl = function(id, partNumber, path) {
      return upload(id).get({ part_number: partNumber, path: path }, {'X-CLIENT-NOTIFY-ERROR': false});
    };

    /**
     * @ngdoc function
     * @name complete
     * @methodOf predicsis.jsSDK.models.Uploads
     * @description Complete a multipart upload
     * @return {Promise} resolve when upload is completed
     */
    this.complete = function(id, path) {
      return upload(id).patch({ path: path }, {}, {'X-CLIENT-NOTIFY-ERROR': false});
    };

  });
