/**
 * @ngdoc service
 * @name predicsis.jsSDK.models.OauthApplications
 * @requires Restangular
 * @description
 * <table>
 *   <tr>
 *     <td><span class="badge post">post</span> <kbd>/settings/applications</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.models.OauthApplications#methods_create OauthApplications.create()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge get">get</span> <kbd>/settings/applications</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.models.OauthApplications#methods_all OauthApplications.all()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge get">get</span> <kbd>/settings/applications/:token_id</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.models.OauthApplications#methods_get OauthApplications.get()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge patch">patch</span> <kbd>/settings/applications/:token_id</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.models.OauthApplications#methods_update OauthApplications.update()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge delete">delete</span> <kbd>/settings/applications/:token_id</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.models.OauthApplications#methods_delete OauthApplications.delete()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tfoot>
 *     <tr><td colspan="3">Official documentation is available at:
 *       <ul>
 *         <li>https://developer.predicsis.com/doc/v1/overview/oauth2/</li>
 *       </td></tr>
 *   </tfoot>
 * </table>
 *
 * Output example:
 * <pre>
 *   {
 *     application: {
 *       id: "540778b5353834003e050000",
 *       name: "essai",
 *       uid: "829b6d53ac27d6cf9670725eb22288dd3914d4d3a811b0d036fd5eb2bc275540",
 *       secret: "e7a9d71fbcd0e0f4f1a78b7dbbd8311d91517ca0ee1d74594db11b6a60a13732",
 *       redirect_uri: "http://truc.bidule",
 *       owner_id: "540762703263310008000000",
 *       created_at: "2014-09-03T20:23:17.025Z",
 *       updated_at: "2014-09-03T20:23:17.025Z"
 *     }
 *   }
 * </pre>
 */
angular
  .module('predicsis.jsSDK.models')
  .service('OauthApplications', function(Restangular) {
    'use strict';

    function settings() { return Restangular.all('settings'); }
    function applications() { return settings().all('applications'); }

    // -----------------------------------------------------------------------------------------------------------------

    /**
     * @ngdoc function
     * @name create
     * @methodOf predicsis.jsSDK.models.OauthApplications
     * @description Create a new Oauth application
     * @param {String} name Your application's name
     * @param {String} redirectURI The URL in your app where users will be sent after authorization
     * @return {Object} A new and ready-to-use Oauth application
     * <pre>
     * {
     *   application: {
     *     id: "540778b5353834003e050000",
     *     name: "essai",
     *     uid: "829b6d53ac27d6cf9670725eb22288dd3914d4d3a811b0d0365...",
     *     secret: "e7a9d71fbcd0e0f4f1a78b7dbbd8311d91517ca0ee1d74594db...",
     *     redirect_uri: "http://truc.bidule",
     *     owner_id: "540762703263310008000000",
     *     created_at: "2014-09-03T20:23:17.025Z",
     *     updated_at: "2014-09-03T20:23:17.025Z"
     *   }
     * }
     * </pre>
     */
    this.create = function(name, redirectURI) {
      return applications().post({application: {name: name, redirect_uri: redirectURI}});
    };

    /**
     * @ngdoc function
     * @name all
     * @methodOf predicsis.jsSDK.models.OauthApplications
     * @return {Object} List of all active applications
     * <pre>{ applications: [ {...}, {...}, {...} ] }</pre>
     */
    this.all = function() {
      return applications().getList();
    };

    /**
     * @ngdoc function
     * @name get
     * @methodOf predicsis.jsSDK.models.OauthApplications
     * @return {Object} Requested application (if exists, 404 otherwise)
     * <pre>{ application: {...} }</pre>
     */
    this.get = function(appId) {
      return settings().one('applications', appId).get();
    };

    /**
     * @ngdoc function
     * @name update
     * @methodOf predicsis.jsSDK.models.OauthApplications
     * @param {String} appId Identifier of the application you want to update
     * @param {Object} changes List of changes you want to save. You can act on the following parameters:
     * <ul>
     *   <li>name</li>
     *   <li>redirect_uri</li>
     * </ul>
     * @return {Object} Updated application
     * <pre>{ application: {...} }</pre>
     */
    this.update = function(appId, changes) {
      return settings().one('applications', appId).patch({application: changes});
    };

    /**
     * @ngdoc function
     * @name delete
     * @methodOf predicsis.jsSDK.models.OauthApplications
     * @description Revoke an application (returns a 204 No-Content)
     */
    this.delete = function(appId) {
      return settings().one('applications', appId).remove();
    };

  });
