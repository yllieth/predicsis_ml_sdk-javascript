/**
 * @ngdoc service
 * @name predicsis.jsSDK.Projects
 * @requires $q
 * @requires Restangular
 * @description
 * <table>
 *   <tr>
 *     <td><span class="badge post">post</span> <kbd>/projects</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.Projects#methods_create Projects.create()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge get">get</span> <kbd>/projects</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.Projects#methods_all Projects.all()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge get">get</span> <kbd>/projects/:id</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.Projects#methods_get Projects.get()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge patch">patch</span> <kbd>/projects/:id</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.Projects#methods_update Projects.update()}</kbd></td>
 *     <td><span class="badge async">async</span></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge delete">delete</span> <kbd>/projects/:id</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.Projects#methods_delete Projects.delete()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tfoot>
 *     <tr><td colspan="3">There is no official documentation for this resource.</td></tr>
 *   </tfoot>
 * </table>
 *
 * Output example:
 * <pre>
 * {
 *   id: '54ca326561707000017b0200',
 *   created_at: '2015-01-29T13:15:17.224Z',
 *   updated_at: '2015-01-29T13:54:37.919Z',
 *   title: 'dualplay',
 *   main_modality: '1',
 *   dictionary_id: '54ca32a261707000017e0200',
 *   target_variable_id: '54ca32a1776f720001bc0900',
 *   classifier_id: '54ca332461707000018d0200',
 *   preparation_rules_set_id: '54ca331b61707000018a0200',
 *   modalities_set_id: '54ca33116170700001870200',
 *   learning_dataset_id: '54c60ca16170700001020000',
 *   scoring_dataset_ids: ['54c60ca16170700001020000'],
 *   scoreset_ids: ['54ca3b9761707000019b0200'],
 *   report_ids: [
 *     '54ca33396170700001930200',
 *     '54ca33396170700001960200',
 *     '54ca33386170700001900200'
 *   ],
 *   is_dictionary_verified: true,
 *   user_id: '541b06dc617070006d060000'
 * }
 * </pre>
 *
 * See {@link predicsis.jsSDK.projectsHelper projects helper} to get the following methods:
 * <ul>
 *   <li><code>{@link predicsis.jsSDK.projectsHelper#methods_isModelDone isModelDone(Projects project)}</code></li>
 *   <li><code>{@link predicsis.jsSDK.projectsHelper#methods_isDictionaryVerified isDictionaryVerified(Projects project)}</code></li>
 *   <li><code>{@link predicsis.jsSDK.projectsHelper#methods_addLearningDataset addLearningDataset(Projects project, String datasetId)}</code></li>
 *   <li><code>{@link predicsis.jsSDK.projectsHelper#methods_addScoringDataset addScoringDataset(Projects project, String datasetId)}</code></li>
 *   <li><code>{@link predicsis.jsSDK.projectsHelper#methods_addScoreset addScoreset(Projects project, String datasetId)}</code></li>
 *   <li><code>{@link predicsis.jsSDK.projectsHelper#methods_resetDictionary resetDictionary(String projectId)}</code></li>
 *   <li><code>{@link predicsis.jsSDK.projectsHelper#methods_removeDependencies removeDependencies(String projectId)}</code></li>
 * </ul>
 */
angular.module('predicsis.jsSDK')
  .service('Projects', function($q, Restangular) {
    'use strict';

    function project(id) { return Restangular.one('projects', id); }
    function projects() { return Restangular.all('projects'); }

    // -----------------------------------------------------------------------------------------------------------------

    /**
     * @ngdoc function
     * @name create
     * @methodOf predicsis.jsSDK.Projects
     * @description Send POST request to the <code>project</code> API resource.
     * @param {Object} params See above example.
     * @return {Object} Promise of a new project
     */
    this.create = function(params) {
      return projects().post({project: params});
    };

    /**
     * @ngdoc function
     * @name all
     * @methodOf predicsis.jsSDK.Projects
     * @description Get all (or a list of) projects
     * @param {Array} [projectIds] List of project's id you want to fetch
     * @return {Object} Promise of a projects list
     */
    this.all = function(projectIds) {
      if(projectIds === undefined) {
        return projects(projectIds).getList();
      } else {
        projectIds = projectIds || [];

        return $q.all(projectIds.map(function(id) {
          return project(id).get();
        }));
      }
    };

    /**
     * @ngdoc function
     * @name get
     * @methodOf predicsis.jsSDK.Projects
     * @description Get a single project by its id
     * @param {String} projectId Project identifier
     * @return {Object} Promise of a project
     */
    this.get = function(projectId) {
      return project(projectId).get();
    };

    /**
     * @ngdoc function
     * @name update
     * @methodOf predicsis.jsSDK.Projects
     * @description Update specified project
     * @param {String} projectId Id of the project you want to update
     * @param {Object} changes see above description to know parameters you are able to update
     * @return {Object} Promise of the updated project
     */
    this.update = function(projectId, changes) {
      return project(projectId).patch({project: changes});
    };

    /**
     * @ngdoc function
     * @name delete
     * @methodOf predicsis.jsSDK.Projects
     * @description Permanently destroy a specified project
     *  <b>Important:</b> {@link predicsis.jsSDK.projectsHelper#methods_removeDependencies Remove project's dependencies}
     *  prior to delete the project itself !
     *
     * @example
     * <pre>
     *   projectsHelper.removeDependencies(projectId)
     *     .then(function() { return Projects.delete(projectId); })
     *     .then(function() { ... } );
     * </pre>
     *
     * @param {String} projectIds Id of the project you want to remove
     * @return {Object} Promise of an empty project
     */
    this.delete = function(projectId) {
      return project(projectId).remove();
    };

  });
