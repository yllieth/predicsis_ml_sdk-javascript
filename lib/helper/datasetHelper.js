/**
 * @ngdoc service
 * @name predicsis.jsSDK.helpers.datasetHelper
 * @description Give some utility method on a {@link predicsis.jsSDK.models.Datasets dataset} object
 */
angular
  .module('predicsis.jsSDK.helpers')
  .service('datasetHelper', function() {

    /**
     * @ngdoc function
     * @methodOf predicsis.jsSDK.helpers.datasetHelper
     * @name hasChildren
     * @description Tells if a dataset has subsets
     * @param {Object} dataset Instance of {@link predicsis.jsSDK.models.Datasets dataset}
     * @return {Boolean} <kbd>true</kbd> / <kbd>false</kbd>
     */
    this.hasChildren = function(dataset) {
      return Boolean(dataset.children_dataset_ids.length > 0);
    };

    /**
     * @ngdoc function
     * @methodOf predicsis.jsSDK.helpers.datasetHelper
     * @name isParent
     * @description Tells if a dataset is a parent dataset.
     * <b>Note:</b> A parent may have any children, but its <kbd>parent_dataset_id</kbd> must be null
     * @param {Object} dataset Instance of {@link predicsis.jsSDK.models.Datasets dataset}
     * @return {Boolean} <kbd>true</kbd> / <kbd>false</kbd>
     */
    this.isParent = function(dataset) {
      return Boolean(dataset.parent_dataset_id === null);
    };

    /**
     * @ngdoc function
     * @methodOf predicsis.jsSDK.helpers.datasetHelper
     * @name isChil
     * @description Tells if a dataset is a child dataset
     * <b>Note:</b> A dataset is considered as a child if it has a parent. There is no orphan among datasets!
     * @param {Object} dataset Instance of {@link predicsis.jsSDK.models.Datasets dataset}
     * @return {Boolean} <kbd>true</kbd> / <kbd>false</kbd>
     */
    this.isChild = function(dataset) {
      return Boolean(dataset.parent_dataset_id !== null);
    };

    /**
     * @ngdoc function
     * @methodOf predicsis.jsSDK.helpers.datasetHelper
     * @name isTrainPart
     * @description Tells if a dataset is a train subset.
     * <b>Note:</b> A dataset is considered as a train subset if its sampling is positive
     * @param {Object} dataset Instance of {@link predicsis.jsSDK.models.Datasets dataset}
     * @return {Boolean} <kbd>true</kbd> / <kbd>false</kbd>
     */
    this.isTrainPart = function(dataset) {
      return this.isChild(dataset) && dataset.sampling > 0;
    };

    /**
     * @ngdoc function
     * @methodOf predicsis.jsSDK.helpers.datasetHelper
     * @name isTestPart
     * @description Tells if a dataset is a train subset.
     * <b>Note:</b> A dataset is considered as a test subset if its sampling is negative
     * @param {Object} dataset Instance of {@link predicsis.jsSDK.models.Datasets dataset}
     * @return {Boolean} <kbd>true</kbd> / <kbd>false</kbd>
     */
    this.isTestPart = function(dataset) {
      return this.isChild(dataset) && dataset.sampling < 0;
    };

    /**
     * @ngdoc function
     * @methodOf predicsis.jsSDK.helpers.datasetHelper
     * @name isFormatted
     * @description Tells if a dataset has both header and separator defined.
     * @param {Object} dataset Instance of {@link predicsis.jsSDK.models.Datasets dataset}
     * @return {Boolean} <kbd>true</kbd> / <kbd>false</kbd>
     */
    this.isFormatted = function(dataset) {
      return Boolean(dataset.header !== null) && Boolean(dataset.separator !== null)
    };

    /**
     * @ngdoc function
     * @methodOf predicsis.jsSDK.helpers.datasetHelper
     * @name isScore
     * @description Tells if a dataset is the result of a score.
     * A score result is identified by the following rules:
     * <ul>
     *   <li><code>dataset.source_ids.length === 0</code></li>
     *   <li><code>dataset.main_modality !== null</code></li>
     *   <li><code>dataset.classifier !== null</code></li>
     *   <li><code>dataset.dataset_id !== null</code></li>
     * </ul>
     * @param {Object} dataset Instance of {@link predicsis.jsSDK.models.Datasets dataset}
     * @return {Boolean} <kbd>true</kbd> / <kbd>false</kbd>
     */
    this.isScore = function(dataset) {
      return Boolean(dataset.source_ids.length === 0)
        && Boolean(dataset.main_modality !== null)
        && Boolean(dataset.classifier !== null)
        && Boolean(dataset.dataset_id !== null);
    };

  });
