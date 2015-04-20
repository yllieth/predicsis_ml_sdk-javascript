/**
 * @ngdoc service
 * @name predicsis.jsSDK.UserSettings
 * @requires Restangular
 * @description
 * <table>
 *   <tr>
 *     <td><span class="badge get">get</span> <kbd>/settings</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.UserSettings#methods_get UserSettings.get()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge patch">patch</span> <kbd>/settings</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.UserSettings#methods_update UserSettings.update()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tfoot>
 *     <tr><td colspan="3">Official documentation is available at:
 *       <ul>
 *         <li>https://developer.predicsis.com/doc/v1/user/settings/</li>
 *       </td></tr>
 *   </tfoot>
 * </table>
 */
angular.module('predicsis.jsSDK')
  .service('UserSettings', function(Restangular) {
    'use strict';

    /**
     * @ngdoc function
     * @name get
     * @methodOf predicsis.jsSDK.UserSettings
     * @description Get active user's settings
     * @return {Promise} User's settings
     * <pre>
     *   {
     *      timezone: 'Europe/Paris',
     *      locale: 'fr-FR'
     *   }
     * </pre>
     */
    this.get = function() {
      return Restangular.one('settings', '').get();
    };

    /**
     * @ngdoc function
     * @name update
     * @methodOf predicsis.jsSDK.UserSettings
     * @description Save user's settings
     * You can update the following parameters:
     *  <ul>
     *    <li><code>{String} timezone</code></li>
     *    <li><code>{String} locale</code></li>
     *  </ul>
     *
     * @param {Object} settings Se above description
     * @return {Promise} Updated user's settings
     */
    this.update = function(changes) {
      return Restangular.all('settings').patch({settings: changes});
    };
  });
