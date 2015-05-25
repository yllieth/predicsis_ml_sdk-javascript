/**
 * @ngdoc service
 * @name predicsis.jsSDK.helpers.modelHelper
 * @requires $injector
 * - {@link predicsis.jsSDK.models.Datasets Datasets}
 * - {@link predicsis.jsSDK.models.Models Models}
 * - {@link predicsis.jsSDK.models.Reports Reports}
 * - {@link predicsis.jsSDK.models.Projects Projects}
 * - {@link predicsis.jsSDK.models.PreparationRules PreparationRules}
 * - $q
 * - $rootScope
 */
angular
  .module('predicsis.jsSDK.helpers')
  .service('modelHelper', function($injector) {
    'use strict';

    /**
     * @ngdoc function
     * @name learn
     * @methodOf predicsis.jsSDK.helpers.modelHelper
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
     *   <li><kbd>project.target_variable_id</kbd> to create a valid {@link predicsis.jsSDK.models.PreparationRules PreparationRules}</li>
     *   <li><kbd>project.id</kbd> to store preparation rules set, classifier and reports ids.</li>
     * </ul>
     *
     * Please also note that if your project doesn't have a <code>main_modality</code> parameter, only univariate
     * supervised report will be created. If this property is here, we also generate classifier evaluation reports
     * for train and test datasets.
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
     * @param {Object} project Instance of a valid {@link predicsis.jsSDK.models.Projects Project}
     * @return {Object} Instance of a complete {@link predicsis.jsSDK.models.Models Models}
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

          var requestedReports = {
            univariate_supervised_report: Reports.createUnivariateSupervisedReport(project)
          };

          if (project.main_modality !== null) {
            requestedReports['train_classifier_evaluation_report'] = Reports.createTrainClassifierEvaluationReport(project);
            requestedReports['test_classifier_evaluation_reports'] = Reports.createTestClassifierEvaluationReport(project);
          }

          return $q.all(requestedReports);
        })
        //update project
        .then(function(reports) {
          var reportIds = [];
          reportIds[0] = reports.train_classifier_evaluation_report.id;
          reportIds[1] = reports.test_classifier_evaluation_reports.id;
          reportIds[2] = reports.univariate_supervised_report.id;
          //reportIds[3] = reports.univariate_unsupervised_report.id;

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

  });
