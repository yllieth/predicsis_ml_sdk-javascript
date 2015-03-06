/**
 * @ngdoc service
 * @name API.model.Uploads
 * @requires $q
 * @requires apiRestangular
 * @requires jobCompletion
 * @description
 * <table>
 *   <tr>
 *     <td><span class="badge get">get</span> <kbd>/sources/credentials/s3</kbd></td>
 *     <td><kbd>{@link API.model.Uploads#methods_getcredentials Upload.getCredentials()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge post">post</span> <kbd>/sources/credentials/s3</kbd></td>
 *     <td><kbd>{@link API.model.Uploads#methods_sign Upload.sign(key)}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tfoot>
 *   <tr><td colspan="3">Official documentation is available at https://developer.predicsis.com/doc/v1/data_management/upload/</td></tr>
 *   </tfoot>
 * </table>
 *
 * Uploads are performed in 3 steps (this model only deals with the first one):
 * <ul>
 *   <li>Get credentials to our storage service and upload a file</li>
 *   <li>Create a source to persist upload in our database</li>
 *   <li>Create a dataset from this source</li>
 * </ul>
 */
angular.module('API.model')
  .service('Uploads', function(apiRestangular) {

    function credentials(storageService) { return apiRestangular.all('sources').one('credentials', storageService); }

    // -----------------------------------------------------------------------------------------------------------------

    /**
     * @ngdoc function
     * @name getCredentials
     * @methodOf API.model.Uploads
     * @description Request credentials to our storage service
     *  Credentials for S3 storage looks like:
     *  <pre>
     *  {
     *    credentials: {
     *      expires_at: "2014-06-23T08:07:19.000Z",
     *      key: "uploads/5347b31750432d45a5020000/sources/1415101671848/${filename}",
     *      aws_access_key_id: "predicsis_aws_access_key_id",
     *      signature: "encoded_signature",
     *      policy: "encoded_policy",
     *      s3_endpoint: "http://dev.public.kml-api.s3-us-west-2.amazonaws.com"
     *    }
     *  }
     *  </pre>
     *
     * @param {String} storageService Available services are : <ul><li><code>s3</code></li></ul>
     * @return {Object} See above description
     */
    this.getCredentials = function(storageService) {
      return credentials(storageService).get();
    };

    /**
     * @ngdoc function
     * @name sign
     * @methodOf API.model.Uploads
     * @description Sign POST requests from fineuploader library
     *  This route is required to use {@link http://docs.fineuploader.com/branch/master/endpoint_handlers/amazon-s3.html#required-server-side-tasks-all-browsers fineuploader library}.
     *
     *  <b>Important note</b>
     *  This request returns a object like:
     *  <pre>
     *  {
     *    credentials: {
     *      expires_at: "2014-06-23T08:07:19.000Z",
     *      key: "uploads/5347b31750432d45a5020000/sources/1415101671848/${filename}",
     *      aws_access_key_id: "predicsis_aws_access_key_id",
     *      signature: "encoded_signature",
     *      policy: "encoded_policy",
     *      s3_endpoint: "http://dev.public.kml-api.s3-us-west-2.amazonaws.com"
     *    }
     *  }
     *  </pre>
     *
     *  ... but the library only needs (and expects) <kbd>policy</kbd> and <kbd>signature</kbd> properties. So I had to
     *  change the source code of fineuploader lib to remove the header of the response. That's the main reason to commit
     *  this source code in the project (under <kbd>app/vendor/s3.fineuploader-5.0.8/</kbd>).
     *
     * @param {String} key Path where the file is going to be uploaded
     * @return {Object} A credentials object which must contains at least <kbd>policy</kbd> and <kbd>signature</kbd> properties.
     */
    this.sign = function(key) {
      return credentials('s3', key).post({credentials: {key: key}});
    };

  });
