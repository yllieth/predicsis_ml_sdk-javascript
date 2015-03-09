/**
 * @ngdoc service
 * @name predicsis.jsSDK.modelHelper
 * @require $injector
 * - Datasets
 * - Models
 * - Reports
 * - Projects
 * - PreparationRules
 * - $q
 */
angular.module('predicsis.jsSDK')
  .service('modelHelper', function($injector) {

    this.learn = function(project) {
      var Datasets = $injector.get('Datasets');
      var Models = $injector.get('Models');
      var Reports = $injector.get('Reports');
      var Projects = $injector.get('Projects');
      var PreparationRules = $injector.get('PreparationRules');
      var $q = $injector.get('$q');
      var results = {};

      return Datasets.getChildren(project.learning_dataset_id)
        .then(function(children) {
          if(!children.train) {
            throw 'Invalid project on POST preparation_rules, no valid train dataset found';
          }

          return PreparationRules.create({
            variable_id: project.target_variable_id,
            dataset_id: children.train.id
          });
        })
        // create the model from preparation rules set
        .then(function(preparationRulesRet) {
          results.preparation_rules_set = preparationRulesRet;
          return Models.createClassifier(preparationRulesRet.id);
        })
        // generate reports
        .then(function(classifier) {
          results.classifier = classifier;
          // classifier_id is required to generate reports,
          // but the PATCH request will occurs after the learn process.
          // this tweak allow project generation.
          project.classifier_id = classifier.id;
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
