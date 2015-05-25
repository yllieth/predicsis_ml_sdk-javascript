/**
 * @ngdoc service
 * @name predicsis.jsSDK.helpers.projectsHelper
 * @require $injector
 */
angular
  .module('predicsis.jsSDK.helpers')
  .service('projectsHelper', function($injector) {
    'use strict';

    var Projects = $injector.get('Projects');

    // --- Getter methods ----------------------------------------------------------------------------------------------

    /**
     * @ngdoc function
     * @methodOf predicsis.jsSDK.helpers.projectsHelper
     * @name isModelDone
     * @description Tells if there is a model for the given project.
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
     * @methodOf predicsis.jsSDK.helpers.projectsHelper
     * @name isDictionaryVerified
     * @description Tells if the user checked its project's dictionary.
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

    // --- Altering methods --------------------------------------------------------------------------------------------

    /**
     * @ngdoc function
     * @methodOf predicsis.jsSDK.helpers.projectsHelper
     * @name addLearningDataset
     * @description Simply adds an entry to <code>learning_dataset_id</code> project's property.
     *
     * <span class="badge patch">patch</span><code>/projects/:projectId</code>
     *
     * @param {Object} project {@link API.model.Projects Projects model}
     * @param {String} datasetId Id of the dataset which will be used for learning
     * @return {Object} Promise of an updated project
     */
    this.addLearningDataset = function(project, datasetId) {
      return Projects.update(project.id, {learning_dataset_id: datasetId});
    };

    /**
     * @ngdoc function
     * @methodOf predicsis.jsSDK.helpers.projectsHelper
     * @name addScoringDataset
     * @description Simply adds an entry to <code>scoring_dataset_ids</code> project's array.
     *
     * <span class="badge patch">patch</span><code>/projects/:projectId</code>
     *
     * @param {Object} project {@link API.model.Projects Projects model}
     * @param {String} datasetId Id of the dataset which will be used for score
     * @return {Object} Promise of an updated project
     */
    this.addScoringDataset = function(project, datasetId) {
      var update = {};
      update.scoring_dataset_ids = project.scoring_dataset_ids || [];
      update.scoring_dataset_ids.push(datasetId);
      return Projects.update(project.id, update);
    };

    /**
     * @ngdoc function
     * @methodOf predicsis.jsSDK.helpers.projectsHelper
     * @name addScoreset
     * @description Simply adds an entry to <code>scoreset_ids</code> project's array.
     *
     * <span class="badge patch">patch</span><code>/projects/:projectId</code>
     *
     * @param {Object} project {@link API.model.Projects Projects model}
     * @param {String} datasetId Id of the dataset which will store score results
     * @return {Object} Promise of an updated project
     */
    this.addScoreset = function(project, datasetId) {
      var update = {};
      update.scoreset_ids = project.scoreset_ids || [];
      update.scoreset_ids.push(datasetId);
      return Projects.update(project.id, update);
    };

    /**
     * @ngdoc function
     * @methodOf predicsis.jsSDK.helpers.projectsHelper
     * @name resetDictionary
     * @description Simply set to <code>null</code> the following project's properties:
     * <ul>
     *   <li><code>dictionary_id</code></li>
     *   <li><code>is_dictionary_verified</code></li>
     *   <li><code>target_variable_id</code></li>
     *   <li><code>main_modality</code></li>
     * </ul>
     *
     * <br/>
     * <span class="badge patch">patch</span><code>/projects/:projectId</code>
     *
     * @param {String} projectId Id of the project you want to update
     * @return {Object} Promise of an updated project
     */
    this.resetDictionary = function(projectId) {
      return Projects.update(projectId, {
        dictionary_id: null,
        is_dictionary_verified: null,
        target_variable_id: null,
        main_modality: null
      });
    };

    /**
     * @ngdoc function
     * @methodOf predicsis.jsSDK.helpers.projectsHelper
     * @name removeDependencies
     * @description Removes linked resources prior to being able to remove the project
     *
     * <div><span class="badge get">get</span><code>/projects/:projectId</code></div>
     * <div><span class="badge delete">delete</span><code>/dictionaries/:project.dictionary_id</code></div>
     * <div><span class="badge delete">delete</span><code>/model/:project.classifier_id</code></div>
     *
     * @param {String} projectId Id of the project you want to update
     * @return {Object} Promise of an updated project
     */
    this.removeDependencies = function(projectId) {
      var Dictionaries = $injector.get('Dictionaries');
      var Models = $injector.get('Models');

      return Projects.get(projectId)
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
  });
