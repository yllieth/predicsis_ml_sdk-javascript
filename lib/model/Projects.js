/**
 * @ngdoc service
 * @name predicsis.jsSDK.models.Projects
 * @requires $q
 * @requires $injector
 * @requires Restangular
 * @description
 * <table>
 *   <tr>
 *     <td><span class="badge post">post</span> <kbd>/projects</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.models.Projects#methods_create Projects.create()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge get">get</span> <kbd>/projects</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.models.Projects#methods_all Projects.all()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge get">get</span> <kbd>/projects/:id</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.models.Projects#methods_get Projects.get()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge patch">patch</span> <kbd>/projects/:id</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.models.Projects#methods_update Projects.update()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge patch">patch</span> <kbd>/projects/:id</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.models.Projects#methods_addLearningDataset addLearningDataset()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge patch">patch</span> <kbd>/projects/:id</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.models.Projects#methods_addScoringDataset addScoringDataset()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge patch">patch</span> <kbd>/projects/:id</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.models.Projects#methods_addScoreset addScoreset()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge patch">patch</span> <kbd>/projects/:id</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.models.Projects#methods_resetDictionary resetDictionary()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge delete">delete</span> <kbd>/projects/:id</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.models.Projects#methods_delete Projects.delete()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tr>
 *     <td>
 *       <div><span class="badge delete">delete</span><code>/dictionaries/:project.dictionary_id</code></div>
 *       <div><span class="badge delete">delete</span><code>/model/:project.classifier_id</code></div>
 *     </td>
 *     <td><kbd>{@link predicsis.jsSDK.models.Projects#methods_removeDependencies removeDependencies()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tr>
 *     <td>Checks if there is a model for the given project</td>
 *     <td colspan="2"><kbd>{@link predicsis.jsSDK.models.Projects#methods_isModelDone isModelDone()}</kbd></td>
 *   </tr>
 *   <tr>
 *     <td>Checks if the user checked its project's dictionary</td>
 *     <td colspan="2"><kbd>{@link predicsis.jsSDK.models.Projects#methods_isDictionaryVerified isDictionaryVerified()}</kbd></td>
 *   </tr>
 *   <tfoot>
 *     <tr><td colspan="3">There is no official documentation for this resource.</td></tr>
 *   </tfoot>
 * </table>
 *
 * Output example:
 * <pre>
 *   {
 *     id: '54ca326561707000017b0200',
 *     created_at: '2015-01-29T13:15:17.224Z',
 *     updated_at: '2015-01-29T13:54:37.919Z',
 *     title: 'dualplay',
 *     main_modality: '1',
 *     dictionary_id: '54ca32a261707000017e0200',
 *     target_variable_id: '54ca32a1776f720001bc0900',
 *     classifier_id: '54ca332461707000018d0200',
 *     preparation_rules_set_id: '54ca331b61707000018a0200',
 *     modalities_set_id: '54ca33116170700001870200',
 *     learning_dataset_id: '54c60ca16170700001020000',
 *     scoring_dataset_ids: ['54c60ca16170700001020000'],
 *     scoreset_ids: ['54ca3b9761707000019b0200'],
 *     report_ids: [
 *       '54ca33396170700001930200',
 *       '54ca33396170700001960200',
 *       '54ca33386170700001900200'
 *     ],
 *     is_dictionary_verified: true,
 *     user_id: '541b06dc617070006d060000'
 *   }
 * </pre>
 *
 * <b><code>learning_dataset_id</code></b> : is the id of the parent dataset.
 * During the process this parent dataset will be splitted into 2 subsets (train and test). This field in project
 * resource is designed to store the parent dataset.
 *
 * <b><code>reports_ids</code></b> : is an array of ids where reports should always be stored in the same order:
 * <ol>
 *   <li>classifier evaluation report for train part</li>
 *   <li>classifier evaluation report for test part</li>
 *   <li>univariate supervised report</li>
 *   <li>univariate unsupervised report</li>
 * </ol>
 */
angular
  .module('predicsis.jsSDK.models')
  .service('Projects', function($q, $injector, Restangular) {
    'use strict';

    function project(id) { return Restangular.one('projects', id); }
    function projects() { return Restangular.all('projects'); }

    // -----------------------------------------------------------------------------------------------------------------

    /**
     * @ngdoc function
     * @name create
     * @methodOf predicsis.jsSDK.models.Projects
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
     * @methodOf predicsis.jsSDK.models.Projects
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
     * @methodOf predicsis.jsSDK.models.Projects
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
     * @methodOf predicsis.jsSDK.models.Projects
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
     * @methodOf predicsis.jsSDK.models.Projects
     * @description Permanently destroy a specified project
     *  <b>Important:</b> {@link predicsis.jsSDK.models.Projects#methods_removeDependencies Remove project's dependencies}
     *  prior to delete the project itself !
     *
     * @example
     * <pre>
     *   Projects.removeDependencies(projectId)
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

    // --- Altering methods --------------------------------------------------------------------------------------------

    /**
     * @ngdoc function
     * @methodOf predicsis.jsSDK.models.Projects
     * @name addLearningDataset
     * @description Simply adds an entry to <code>learning_dataset_id</code> project's property.
     * @param {Object} project {@link API.model.Projects Projects model}
     * @param {String} datasetId Id of the dataset which will be used for learning
     * @return {Object} Promise of an updated project
     */
    this.addLearningDataset = function(project, datasetId) {
      return this.update(project.id, {learning_dataset_id: datasetId});
    };

    /**
     * @ngdoc function
     * @methodOf predicsis.jsSDK.models.Projects
     * @name addScoringDataset
     * @description Simply adds an entry to <code>scoring_dataset_ids</code> project's array.
     * @param {Object} project {@link API.model.Projects Projects model}
     * @param {String} datasetId Id of the dataset which will be used for score
     * @return {Object} Promise of an updated project
     */
    this.addScoringDataset = function(project, datasetId) {
      var update = {};
      update.scoring_dataset_ids = project.scoring_dataset_ids || [];
      update.scoring_dataset_ids.push(datasetId);
      return this.update(project.id, update);
    };

    /**
     * @ngdoc function
     * @methodOf predicsis.jsSDK.models.Projects
     * @name addScoreset
     * @description Simply adds an entry to <code>scoreset_ids</code> project's array.
     * @param {Object} project {@link API.model.Projects Projects model}
     * @param {String} datasetId Id of the dataset which will store score results
     * @return {Object} Promise of an updated project
     */
    this.addScoreset = function(project, datasetId) {
      var update = {};
      update.scoreset_ids = project.scoreset_ids || [];
      update.scoreset_ids.push(datasetId);
      return this.update(project.id, update);
    };

    /**
     * @ngdoc function
     * @methodOf predicsis.jsSDK.models.Projects
     * @name resetDictionary
     * @description Simply set to <code>null</code> the following project's properties:
     * <ul>
     *   <li><code>dictionary_id</code></li>
     *   <li><code>is_dictionary_verified</code></li>
     *   <li><code>target_variable_id</code></li>
     *   <li><code>main_modality</code></li>
     * </ul>
     *
     * @param {String} projectId Id of the project you want to update
     * @return {Object} Promise of an updated project
     */
    this.resetDictionary = function(projectId) {
      return this.update(projectId, {
        dictionary_id: null,
        is_dictionary_verified: null,
        target_variable_id: null,
        main_modality: null
      });
    };

    /**
     * @ngdoc function
     * @methodOf predicsis.jsSDK.models.Projects
     * @name removeDependencies
     * @description Removes linked resources prior to being able to remove the project
     * @param {String} projectId Id of the project you want to update
     * @return {Object} Promise of an updated project
     */
    this.removeDependencies = function(projectId) {
      var Dictionaries = $injector.get('Dictionaries');
      var Models = $injector.get('Models');

      return this.get(projectId)
        .then(function(project) {
          // Delete dictionary if exists
          return (project.dictionary_id === null)
            ? project
            : Dictionaries.delete(project.dictionary_id).then(function() { return project; });
        })
        .then(function(project) {
          // Delete dictionary if exists
          return (project.classifier_id === null)
            ? project
            : Models.delete(project.classifier_id).then(
              function() { return project; },
              function(err) { if (err.status === 404) { return project; } else { throw err; }}//In case the api has already deleted it when it's dataset has been deleted
            );
        });
    };

    // --- Getter methods ----------------------------------------------------------------------------------------------

    /**
     * @ngdoc function
     * @methodOf predicsis.jsSDK.models.Projects
     * @name isModelDone
     * @description Checks if there is a model for the given project.
     *
     *  <b>Note:</b> A project can have only one Model. It means that you can go back to the first steps of the scenario
     *  if your current project already has a model attached. If you want to change a parameter, you have to create a new
     *  project.
     *
     * @param {Object} project {@link API.model.Projects Projects model}
     * @return {boolean} <code>true</code> / <code>false</code>
     */
    this.isModelDone = function(project) {
      return Boolean(project.classifier_id);
    };

    /**
     * @ngdoc function
     * @methodOf predicsis.jsSDK.models.Projects
     * @name isDictionaryVerified
     * @description Checks if the user checked its project's dictionary.
     *
     *  A dictionary contains a description of each variable used (or unused) of the model. That's why scenario forces
     *  the user to check generated dictionaries.
     *
     * @param {Object} project {@link API.model.Projects Projects model}
     * @return {boolean} <code>true</code> / <code>false</code>
     */
    this.isDictionaryVerified = function(project) {
      return Boolean(project.is_dictionary_verified);
    };

  });
