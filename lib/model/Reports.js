/**
 * @ngdoc service
 * @name predicsis.jsSDK.models.Reports
 * @requires $q
 * @requires Restangular
 * @requires Jobs
 * @requires $injector
 * - Datasets
 * @description
 * <table>
 *   <tr>
 *     <td><span class="badge post">post</span> <kbd>/reports</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.models.Reports#methods_createTrainClassifierEvaluationReport Reports.createTrainClassifierEvaluationReport()}</kbd></td>
 *     <td><span class="badge async">async</span></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge post">post</span> <kbd>/reports</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.models.Reports#methods_createTestClassifierEvaluationReport Reports.createTestClassifierEvaluationReport()}</kbd></td>
 *     <td><span class="badge async">async</span></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge post">post</span> <kbd>/reports</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.models.Reports#methods_createUnivariateSupervisedReport Reports.createUnivariateSupervisedReport()}</kbd></td>
 *     <td><span class="badge async">async</span></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge post">post</span> <kbd>/reports</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.models.Reports#methods_create Reports.create()}</kbd></td>
 *     <td><span class="badge async">async</span></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge get">get</span> <kbd>/reports</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.models.Reports#methods_all Reports.all()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge get">get</span> <kbd>/reports/:id</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.models.Reports#methods_get Reports.get()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge patch">patch</span> <kbd>/reports/:id</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.models.Reports#methods_update Reports.update()}</kbd></td>
 *     <td><span class="badge async">async</span></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge delete">delete</span> <kbd>/reports/:id</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.models.Reports#methods_delete Reports.delete()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tfoot>
 *     <tr><td colspan="3">
 *       Official documentation is available at:
 *       <ul>
 *         <li>https://developer.predicsis.com/doc/v1/reports/</li>
 *         <li>https://developer.predicsis.com/doc/v1/reports/classifier_evaluation/</li>
 *         <li>https://developer.predicsis.com/doc/v1/reports/univariate_supervised/</li>
 *         <li>https://developer.predicsis.com/doc/v1/reports/univariate_unsupervised/</li>
 *       </ul>
 *       </td></tr>
 *   </tfoot>
 * </table>
 */
angular
  .module('predicsis.jsSDK.models')
  .service('Reports', function($q, $injector, Restangular, Jobs) {
    'use strict';
    var self = this;

    var report = function(id) { return Restangular.one('reports', id); };
    var reports = function() { return Restangular.all('reports'); };
    function createClassifierEvaluationReport(project, type) {
      var Datasets = $injector.get('Datasets');
      return Datasets.getChildren(project.learning_dataset_id)
        .then(function(children) {
          return self.create({
            type: 'classifier_evaluation',
            dataset_id: children[type].id,
            classifier_id: project.classifier_id,
            modalities_set_id: project.modalities_set_id,
            main_modality: project.main_modality
          });
        });
    }

    // -----------------------------------------------------------------------------------------------------------------

    /**
     * @ngdoc function
     * @name createTrainClassifierEvaluationReport
     * @methodOf predicsis.jsSDK.models.Reports
     * @description Generate a classifier evaluation report for train subset
     *
     *  Parameters required to create such a report:
     *  <pre>
     *  {
     *    type:              "classifier_evaluation",
     *    dataset_id:        "53c7dea470632d3417020000",
     *    classifier_id:     "5436431070632d15f4260000",
     *    modalities_set_id: "53fdfa7070632d0fc5030000",
     *    main_modality:     "1"
     *  }
     *  </pre>
     *
     * @param {Object} project Required to have all required ids
     * @return {Object} Promise of a report
     */
    this.createTrainClassifierEvaluationReport = function(project) {
      return createClassifierEvaluationReport(project, 'train');
    };

    /**
     * @ngdoc function
     * @name createTestClassifierEvaluationReport
     * @methodOf predicsis.jsSDK.models.Reports
     * @description Generate a classifier evaluation report for test subset
     *
     *  Parameters required to create such a report:
     *  <pre>
     *  {
     *    type:              "classifier_evaluation",
     *    dataset_id:        "53c7dea470632d3417020000",
     *    classifier_id:     "5436431070632d15f4260000",
     *    modalities_set_id: "53fdfa7070632d0fc5030000",
     *    main_modality:     "1"
     *  }
     *  </pre>
     *
     * @param {Object} project Required to have all required ids
     * @return {Object} Promise of a report
     */
    this.createTestClassifierEvaluationReport = function(project) {
      return createClassifierEvaluationReport(project, 'test');
    };

    /**
     * @ngdoc function
     * @name createUnivariateSupervisedReport
     * @methodOf predicsis.jsSDK.models.Reports
     * @description Generate an univariate supervised report.
     *
     *  Parameters required to create such a report:
     *  <pre>
     *  {
     *    type:          "univariate_supervised",
     *    variable_id:   "5329601c1757f446e6000002",
     *    dataset_id:    "53c7dea470632d3417020000",
     *    dictionary_id: "5363b7fc6879644ae7010000"
     *  }
     *  </pre>
     *
     * @param {Object} project Required to have all required ids
     * @return {Object} Promise of a report
     */
    this.createUnivariateSupervisedReport = function(project) {
      return self.create({
        type: 'univariate_supervised',
        dataset_id: project.learning_dataset_id,
        dictionary_id: project.dictionary_id,
        variable_id: project.target_variable_id
      });
    };

    /**
     * @ngdoc function
     * @name create
     * @methodOf predicsis.jsSDK.models.Reports
     * @description Send POST request to the <code>report</code> API resource.
     *
     *  This request is able to generate different types of report:
     *  <ul>
     *    <li>classifier evaluation:
     *    <pre>
     *    {
     *      type:              "classifier_evaluation",
     *      dataset_id:        "53c7dea470632d3417020000",
     *      classifier_id:     "5436431070632d15f4260000",
     *      modalities_set_id: "53fdfa7070632d0fc5030000",
     *      main_modality:     "1"
     *    }
     *    </pre>
     *    </li>
     *    <li>univariate supervised:
     *    <pre>
     *    {
     *      type:          "univariate_supervised",
     *      variable_id:   "5329601c1757f446e6000002",
     *      dataset_id:    "53c7dea470632d3417020000",
     *      dictionary_id: "5363b7fc6879644ae7010000"
     *    }
     *    </pre>
     *    </li>
     *    <li>univariate unsupervised:
     *    <pre>
     *    {
     *      type:          "univariate_unsupervised",
     *      dictionary_id: "5363b7fc6879644ae7010000",
     *      dataset_id:    "53c7dea470632d3417020000"
     *    }
     *    </pre>
     *    </li>
     *  </ul>
     *
     * @param {Object} params See above example regarding of the type of report you want to generate.
     * @return {Object} Promise of a report
     */
    this.create = function(params) {
      return Jobs.wrapAsyncPromise(reports().post({report: params}))
        .then(function(result) {
          return report(result.id).get();
        });
    };

    /**
     * @ngdoc function
     * @name all
     * @methodOf predicsis.jsSDK.models.Reports
     * @description Get all (or a list of) generated reports
     * @param {Array} [reportIds] List of report's id you want to fetch
     * @return {Object} Promise of a report list
     */
    this.all = function(reportIds) {
      if(reportIds === undefined) {
        return reports(reportIds).getList();
      } else {
        reportIds = reportIds || [];  // allow empty reportIds

        return $q.all(reportIds.map(function(id) {
          return report(id).get();
        }));
      }
    };

    /**
     * @ngdoc function
     * @name get
     * @methodOf predicsis.jsSDK.models.Reports
     * @description Get a single report by its id
     * @param {String} reportId Report identifier
     * @return {Object} Promise of a report
     */
    this.get = function(reportId) {
      return report(reportId).get();
    };

    /**
     * @ngdoc function
     * @name update
     * @methodOf predicsis.jsSDK.models.Reports
     * @description Update specified report
     *
     *  You can update the following parameters:
     *  <ul>
     *    <li><code>{String} title</code></li>
     *  </ul>
     *
     * @param {String} reportId Id of the report you want to update
     * @param {Object} changes see above description to know parameters you are able to update
     * @return {Object} Promise of the updated report
     */
    this.update = function(reportId, changes) {
      return Jobs.wrapAsyncPromise(report(reportId).patch({report: changes}))
        .then(function(result) {
          return report(result.id).get();
        });
    };

    /**
     * @ngdoc function
     * @name delete
     * @methodOf predicsis.jsSDK.models.Reports
     * @description Remove specified report
     * @param {String} ReportId report identifier
     * @return {Object} Promise of a report
     */
    this.delete = function(reportId) {
      return report(reportId).remove();
    };

  });
