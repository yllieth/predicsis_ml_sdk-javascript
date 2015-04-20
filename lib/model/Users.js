/**
 * @ngdoc service
 * @name predicsis.jsSDK.Users
 * @requires $q
 * @requires Restangular
 * @description
 * <table>
 *   <tr>
 *     <td><span class="badge post">post</span> <kbd>/users</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.Users#methods_create Users.create()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge post">post</span> <kbd>/users/password</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.Users#methods_resetPassword Users.resetPassword()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge get">get</span> <kbd>/users/:id</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.Users#methods_getcurrentuser Users.getCurrentUser()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge patch">patch</span> <kbd>/users/:id</kbd><br/><span class="badge patch">patch</span> <kbd>/users/update_password</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.Users#methods_update Users.update()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge delete">delete</span> <kbd>/users/:id</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.Users#methods_delete Users.delete()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tfoot>
 *     <tr><td colspan="3">Official documentation is available at:
 *       <ul>
 *         <li>https://developer.predicsis.com/doc/v1/user/</li>
 *         <li>https://developer.predicsis.com/doc/v1/user/settings/</li>
 *       </td></tr>
 *   </tfoot>
 * </table>
 *
 * Output example
 * <pre>
 *   {
 *     id: "5347b31750432d45a5020000",
 *     created_at: "2014-07-18T06:40:20.845Z",
 *     updated_at: "2014-07-18T06:40:20.847Z",
 *     name: "John Doe",
 *     email: "john.doe@example.org"
 *   }
 * </pre>
 */
angular.module('predicsis.jsSDK')
  .service('Users', function($q, Restangular) {
    'use strict';

    function user(id) { return Restangular.one('users', id); }
    function users() { return Restangular.all('users'); }
    function settings() { return Restangular.all('settings'); }

    // -----------------------------------------------------------------------------------------------------------------

    /**
     * @ngdoc function
     * @name create
     * @methodOf predicsis.jsSDK.Users
     * @description Create a new user
     *
     *  You must give the following parameters to create a new preparation rules set:
     *  <pre>
     *  {
     *    name:  "Test Ouille",
     *    email: "john.doe@example.com",
     *    password: "my-password"
     *  }
     *  </pre>
     *
     * @param {Object} params See above example.
     * @return {Promise} New user
     */
    this.create = function(params) {
      return users().post({ user: params });
    };

    /**
     * @ngdoc function
     * @name resetPassword
     * @methodOf predicsis.jsSDK.Users
     * @description Reset user's password
     * @param {String} email Email of the account you want to reset the password
     * @param {String} redirectUri Url to be redirected after complete resetting password
     * @return {Promise} User with resetted password
     */
    this.resetPassword = function(email, redirectUri) {
      return users().all('password').post({user: {email: email, redirect_uri: redirectUri}});
    };

    /**
     * @ngdoc function
     * @name getCurrentUser
     * @methodOf predicsis.jsSDK.Users
     * @description Get authenticated user
     * @return {Promise} Current user
     */
    this.getCurrentUser = function() {
      return user('me').get();
    };

    /**
     * @ngdoc function
     * @name update
     * @methodOf predicsis.jsSDK.Users
     * @description Update specified user
     *  You can update the following parameters:
     *  <ul>
     *    <li><code>{String} name</code></li>
     *    <li><code>{String} email</code></li>
     *    <li><code>{String} current_password</code></li>
     *    <li><code>{String} password</code></li>
     *  </ul>
     *
     *  <br/>
     *  <b>Note:</b> If <kbd>changes</kbd> param contains both <kbd>current_password</kbd> and <kbd>password</kbd>,
     *  these two properties are sent to <kbd>PATCH /users/update_password</kbd>.
     *  Any other param is sent to <kbd>PATCH /users/:id</kbd>.
     *
     * @param {String} id Id of the user you want to update
     * @param {Object} changes see above description to know parameters you are able to update
     * @return {Promise} Updated user and/or password
     */
    this.update = function(id, changes) {
      if ('current_password' in changes && 'password' in changes) {
        var password = {
          current_password: changes.current_password,
          password: changes.password
        };

        delete changes.current_password;
        delete changes.password;

        if (Object.keys(changes).length > 0) {
          return $q.all({
            profile: user(id).patch({user: changes}),
            password: users().all('update_password').patch({user: password})
          });
        } else {
          return users().all('update_password').patch({user: password});
        }
      } else {
        return user(id).patch({user: changes});
      }
    };

    /**
     * @ngdoc function
     * @name delete
     * @methodOf predicsis.jsSDK.Users
     * @description Permanently destroy a specified preparation rules set
     * @param {String} id Id of the preparation rules set you want to remove
     * @return {Promise} A removed preparation rules set
     */
    this.delete = function(id) {
      return user(id).remove();
    };

  });
