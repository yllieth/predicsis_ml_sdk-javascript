/**
 * @ngdoc service
 * @name predicsis.jsSDK.modelHelper
 * @requires $injector
 * - {@link predicsis.jsSDK.Datasets Datasets}
 * - {@link predicsis.jsSDK.Models Models}
 * - {@link predicsis.jsSDK.Reports Reports}
 * - {@link predicsis.jsSDK.Projects Projects}
 * - {@link predicsis.jsSDK.PreparationRules PreparationRules}
 * - $q
 * - $rootScope
 */
angular.module('predicsis.jsSDK')
  .service('modelHelper', function($injector) {
    'use strict';

    /**
     * @ngdoc function
     * @name learn
     * @methodOf predicsis.jsSDK.modelHelper
     * @description Learn a model
     *
     * This function wraps the following requests:
     * <ul>
     *   <li>GET /datasets</li>
     *   <li>GET /datasets/:trainDatasetId</li>
     *   <li>GET /datasets/:testDatasetId</li>
     *   <li>POST /preparation_rules_sets</li>
     *   <li>POST /models</li>
     *   <li>POST /reports</li>
     *   <li>POST /reports</li>
     *   <li>POST /reports</li>
     *   <li>PATCH /projects/:projectId</li>
     * </ul>
     *
     * ... and each time, waits for job termination!
     *
     * To do so, what we really use are the following parameters:
     * <ul>
     *   <li><kbd>project.learning_dataset_id</kbd> to find the training partition of the input dataset</li>
     *   <li><kbd>project.target_variable_id</kbd> to create a valid {@link predicsis.jsSDK.PreparationRules PreparationRules}</li>
     *   <li><kbd>project.id</kbd> to store preparation rules set, classifier and reports ids.</li>
     * </ul>
     *
     * We also broadcast the following events:
     * <ul>
     *   <li>jsSDK.learn.start-retrieving-train-dataset</li>
     *   <li>jsSDK.learn.start-creating-preparation-rules</li>
     *   <li>jsSDK.learn.start-learning</li>
     *   <li>jsSDK.learn.start-generating-reports</li>
     *   <li>jsSDK.learn.start-updating-project</li>
     * </ul>
     *
     * @param {Object} project Instance of a valid {@link predicsis.jsSDK.Projects Project}
     * @return {Object} Instance of a complete {@link predicsis.jsSDK.Models Models}
     */
    this.learn = function(project) {
      var Datasets = $injector.get('Datasets');
      var Models = $injector.get('Models');
      var Reports = $injector.get('Reports');
      var Projects = $injector.get('Projects');
      var PreparationRules = $injector.get('PreparationRules');
      var $q = $injector.get('$q');
      var $rootScope = $injector.get('$rootScope');
      var results = {};

      $rootScope.$broadcast('jsSDK.learn.start-retrieving-train-dataset');

      return Datasets.getChildren(project.learning_dataset_id)
        .then(function(children) {
          if(!children.train) {
            throw 'Invalid project on POST preparation_rules, no valid train dataset found';
          }

          $rootScope.$broadcast('jsSDK.learn.start-creating-preparation-rules');

          return PreparationRules.create({
            variable_id: project.target_variable_id,
            dataset_id: children.train.id
          });
        })
        // create the model from preparation rules set
        .then(function(preparationRulesRet) {
          results.preparation_rules_set = preparationRulesRet;
          $rootScope.$broadcast('jsSDK.learn.start-learning');
          return Models.createClassifier(preparationRulesRet.id);
        })
        // generate reports
        .then(function(classifier) {
          results.classifier = classifier;
          // classifier_id is required to generate reports,
          // but the PATCH request will occurs after the learn process.
          // this tweak allow project generation.
          project.classifier_id = classifier.id;
          $rootScope.$broadcast('jsSDK.learn.start-generating-reports');
          return $q.all([
            Reports.createTrainClassifierEvaluationReport(project),
            Reports.createTestClassifierEvaluationReport(project),
            Reports.createUnivariateSupervisedReport(project)
          ]);
        })
        //update project
        .then(function(reports) {
          var reportIds = reports.map(function(report) {
            return report.id;
          });
          $rootScope.$broadcast('jsSDK.learn.start-updating-project');
          return Projects.update(project.id, {
            preparation_rules_set_id: results.preparation_rules_set.id,
            classifier_id: results.classifier.id,
            report_ids: reportIds
          });
        })
        //return classifier
        .then(function() {
          return results.classifier;
        });
    };

    /**
     * Get multiple data related to the model.
     *
     *  GET /models/:model_id
     *  GET /preparation_rules_set/:preparation_rules_set_id
     *  GET /datasets/:dataset_id
     *
     *  Once these data are fetched from the API, they are stored in the returned
     *  model object.
     */
    this.fetchRelatedData = function(modelId) {
      var Models = $injector.get('Models');
      var Datasets = $injector.get('Datasets');
      var PreparationRules = $injector.get('PreparationRules');

      return Models.get(modelId)
        .then(function(model) {
          return PreparationRules.get(model.preparation_rules_set_id)
            .then(function(preparationRules) {
              model.preparationRules = preparationRules;

              return Datasets.get(preparationRules.dataset_id)
                .then(function(dataset) {
                  model.preparationRules.dataset = dataset;
                  return model;
                });
            });
        });
    };

  });
