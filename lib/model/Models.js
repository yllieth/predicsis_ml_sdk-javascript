/**
 * @ngdoc service
 * @name predicsis.jsSDK.models.Models
 * @requires $q
 * @requires Restangular
 * @requires Jobs
 * @requires $injector
 * @description
 * <table>
 *   <tr>
 *     <td><span class="badge post">post</span> <kbd>/models</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.models.Models#methods_create Models.create()}</kbd></td>
 *     <td><span class="badge async">async</span></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge post">post</span> <kbd>/models</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.models.Models#methods_create Models.createClassifier()}</kbd></td>
 *     <td><span class="badge async">async</span></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge get">get</span> <kbd>/models</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.models.Models#methods_all Models.all()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge get">get</span> <kbd>/models/:id</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.models.Models#methods_get Models.get()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge patch">patch</span> <kbd>/models/:id</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.models.Models#methods_update Models.update()}</kbd></td>
 *     <td><span class="badge async">async</span></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge delete">delete</span> <kbd>/models/:id</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.models.Models#methods_delete Models.delete()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tr>
 *     <td>Wraps all API requests for a learn</td>
 *     <td colspan="2"><kbd>{@link predicsis.jsSDK.models.Models#methods_learn Models.learn()}</kbd></td>
 *   </tr>
 *   <tfoot>
 *     <tr><td colspan="3">Official documentation is available at:
 *       <ul>
 *         <li>https://developer.predicsis.com/doc/v1/predictive_models/</li>
 *         <li>https://developer.predicsis.com/doc/v1/predictive_models/classifier/</li>
 *       </ul>
 *     </td></tr>
 *   </tfoot>
 * </table>
 *
 * Output example:
 * <pre>
 *   {
 *     id: "54c25b446170700001a80300",
 *     created_at: "2015-01-23T14:31:32.797Z",
 *     updated_at: "2015-01-23T14:31:34.060Z",
 *     title: "",
 *     type: "classifier",
 *     user_id: "541b06dc617070006d060000",
 *     preparation_rules_set_id: null,
 *     job_ids: [ "54c25b446170700001a90300" ],
 *     model_variables: [
 *       {
 *         name: "Petal Width",
 *         level: 0.669445,
 *         weight: 0.789933,
 *         maximum_a_posteriori: true
 *       },
 *       {
 *         name: "Sepal Length",
 *         level: 0.324718,
 *         weight: 0.415522,
 *         maximum_a_posteriori: false
 *       },
 *       {
 *         name: "Petal Length",
 *         level: 0.625078,
 *         weight: 0.392422,
 *         maximum_a_posteriori: false
 *       },
 *       {
 *         name: "Sepal Width",
 *         level: 0.165768,
 *         weight: 0.343345,
 *         maximum_a_posteriori: false
 *       }
 *     ]
 *   }
 * </pre>
 */
angular
  .module('predicsis.jsSDK.models')
  .service('Models', function($q, $injector, Restangular, Jobs) {
    'use strict';
    var self = this;

    function model(id) { return Restangular.one('models', id); }
    function models() { return Restangular.all('models'); }

    // -----------------------------------------------------------------------------------------------------------------

    /**
     * @ngdoc function
     * @name createClassifier
     * @methodOf predicsis.jsSDK.models.Models
     * @description Create a new classifier.
     * Simple shortcut for <code>{@link predicsis.jsSDK.models.Models#method_create Models.create()} function.
     *
     * @param {String} preparationRulesSetId See {@link predicsis.jsSDK.PreparationRules preparation rules} documentation
     * @return {Promise} A new classifier
     */
    this.createClassifier = function(preparationRulesSetId) {
      return self.create({type: 'classifier', preparation_rules_set_id: preparationRulesSetId});
    };

    // -----------------------------------------------------------------------------------------------------------------

    /**
     * @ngdoc function
     * @name create
     * @methodOf predicsis.jsSDK.models.Models
     * @description Create a model
     *
     *  This request is able to create different types of models:
     *
     *  <ul>
     *    <li>supervised classification:
     *    <pre>
     *      {
     *        type: "classifier",
     *        preparation_rules_set_id: "53fe176070632d0fc5100000"
     *      }
     *    </pre>
     *    </li>
     *  </ul>
     *
     * @param {Object} params See above example.
     * @return {Promise} New model
     */
    this.create = function(params) {
      return Jobs.wrapAsyncPromise(models().post({model: params}))
        .then(function(result) {
          return model(result.id).get();
        });
    };

    /**
     * @ngdoc function
     * @name all
     * @methodOf predicsis.jsSDK.models.Models
     * @description Get all (or a list of) models
     * @param {Array} [modelIds] List of models ids you want to fetch
     * @return {Promise} A list of models
     */
    this.all = function(modelIds) {
      if(modelIds === undefined) {
        return models().getList();
      } else {
        modelIds = modelIds || [];

        return $q.all(modelIds.map(function(id) {
          return model(id).get();
        }));
      }
    };

    /**
     * @ngdoc function
     * @name get
     * @methodOf predicsis.jsSDK.models.Models
     * @description Get a single model by its id
     * @param {String} id Model identifier
     * @return {Promise} A model
     */
    this.get = function(id) {
      return model(id).get();
    };

    /**
     * @ngdoc function
     * @name update
     * @methodOf predicsis.jsSDK.models.Models
     * @description Update specified model
     *  You can update the following parameters:
     *  <ul>
     *    <li><code>{String} name</code></li>
     *  </ul>
     *
     * @param {String} id Id of the model you want to update
     * @param {Object} changes see above description to know parameters you are able to update
     * @return {Promise} Updated model
     */
    this.update = function(id, changes) {
      return Jobs.wrapAsyncPromise(model(id).patch({model: changes}))
        .then(function(result) {
          return model(result.id).get();
        });
    };

    /**
     * @ngdoc function
     * @name delete
     * @methodOf predicsis.jsSDK.models.Models
     * @description Permanently destroy a specified model
     * @param {String} id Id of the model you want to remove
     * @return {Promise} A removed model
     */
    this.delete = function(id) {
      return model(id).remove();
    };

    // -----------------------------------------------------------------------------------------------------------------

    /**
     * @ngdoc function
     * @name learn
     * @methodOf predicsis.jsSDK.models.Models
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
      var Models = this;
      var Datasets = $injector.get('Datasets');
      var Reports = $injector.get('Reports');
      var Projects = $injector.get('Projects');
      var PreparationRules = $injector.get('PreparationRules');
      var $rootScope = $injector.get('$rootScope');
      var results = {};

      $rootScope.$broadcast('jsSDK.learn.start-retrieving-train-dataset');

      return Datasets.getChildren(project.learning_dataset_id)
        // create preparation rules
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
