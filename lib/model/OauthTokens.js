/**
 * @ngdoc service
 * @name predicsis.jsSDK.OauthTokens
 * @requires Restangular
 * @description
 * <table>
 *   <tr>
 *     <td><span class="badge post">post</span> <kbd>/settings/tokens</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.OauthTokens#methods_create OauthTokens.create()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge get">get</span> <kbd>/settings/tokens</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.OauthTokens#methods_all OauthTokens.all()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge get">get</span> <kbd>/settings/tokens/:token_id</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.OauthTokens#methods_get OauthTokens.get()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge delete">delete</span> <kbd>/settings/tokens/:token_id</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.OauthTokens#methods_delete OauthTokens.delete()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tfoot>
 *     <tr><td colspan="3">Official documentation is available at:
 *       <ul>
 *         <li>https://developer.predicsis.com/doc/v1/overview/acces_tokens/</li>
 *       </td></tr>
 *   </tfoot>
 * </table>
 */
angular.module('predicsis.jsSDK')
  .service('OauthTokens', function(Restangular) {
    'use strict';

    function settings() { return Restangular.all('settings'); }
    function tokens() { return settings().all('tokens'); }

    // -----------------------------------------------------------------------------------------------------------------

    /**
     * @ngdoc function
     * @name create
     * @methodOf predicsis.jsSDK.OauthTokens
     * @description Create a new personal token.
     *
     * There are 2 things important to know about these tokens:
     * <ul>
     *   <li>They have no expiration date, thus you should avoid keeping an API token that is not used and try change them as often as possible.</li>
     *   <li>This creation request is the only one which displays the token</li>
     * </ul>
     *
     * JSON response for creating new tokens is a bit different from reteive action. It's mainly due to the fact that we
     * give real token only in this function.
     *
     * <pre>
     * {
     *   access_tokens: {
     *     id: "55353df361707000013c0300",
     *     token: "072ac0f1ced442f8c7ec4225e4546819bf8c9c2b8a77c8aebc057748d4ae7a64",
     *     name: "Token for my personal application over Predicsis API",
     *     created_at: "2015-04-20T17:57:07.976Z",
     *     updated_at: "2015-04-20T17:57:07.976Z"
     *   }
     * }
     * </pre>
     *
     * Right after your token creation, you can use it by setting the Authorization header like:
     * <pre>Authorization: Bearer ${new_token}</pre>
     *
     * @param {String} name Give an explicit name for your token
     * @return {Object} Be aware that you can't get your token again.
     */
    this.create = function(name) {
      return tokens().post({token: {name: name}});
    };

    /**
     * @ngdoc function
     * @name all
     * @methodOf predicsis.jsSDK.OauthTokens
     * @description Get the list of created and valid tokens
     *
     * Please note that tokens don't appears. They are only available after their creation.
     *
     * @return {Object}
     * <pre>
     * {
     *   tokens: [
     *     {
     *       id: "5409cc5f69702d0007180000",
     *       created_at: "2014-09-05T14:44:47.172Z",
     *       updated_at: "2014-09-05T14:44:47.172Z"
     *     },
     *     {
     *       id: "55353df361707000013c0300",
     *       created_at: "2015-04-20T17:57:07.976Z",
     *       updated_at: "2015-04-20T17:57:07.976Z"
     *     },
     *     {
     *       id: "55353e3761707000013d0300",
     *       created_at: "2015-04-20T17:58:15.454Z",
     *       updated_at: "2015-04-20T17:58:15.454Z"
     *     }
     *   ]
     * }
     * </pre>
     */
    this.all = function() {
      return tokens().getList();
    };

    /**
     * @ngdoc function
     * @name get
     * @methodOf predicsis.jsSDK.OauthTokens
     * @description Return a single token object. Be aware that this function's result doesn't contain the token.
     * @param {String} tokenId Token unique identifier
     * @return {Object}
     * <pre>
     * {
     *   access_tokens: {
     *     id "5409cc5f69702d0007180000",
     *     created_at: "2014-09-05T14:44:47.172Z",
     *     updated_at: "2014-09-05T14:44:47.172Z"
     *   }
     * }
     * </pre>
     */
    this.get = function(tokenId) {
      return settings().one('tokens', tokenId).get();
    };

    /**
     * @ngdoc function
     * @name delete
     * @methodOf predicsis.jsSDK.OauthTokens
     * @description Revoke a personal token
     *
     * By sending this request, we remove this token from our database which means that all request sent with its will
     * get a 401 Unauthorized HTTP status.
     *
     * This request will result a 204 No-Content status code, except if the token can't be found (in this case, you will get a 404 Not-Found error).
     *
     * @param {String} tokenId Token unique identifier
     */
    this.delete = function(tokenId) {
      return settings().one('tokens', tokenId).remove();
    };

  });
