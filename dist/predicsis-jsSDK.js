angular.module('predicsis.jsSDK.models', []);
angular.module('predicsis.jsSDK.helpers', []);

angular
  .module('predicsis.jsSDK', ['predicsis.jsSDK.models', 'predicsis.jsSDK.helpers', 'restangular'])
  .provider('predicsisAPI', function () {
    'use strict';
    var errorHandler = function(response) { throw Error(response); };
    var baseURL = 'https://api.predicsis.com';
    var oauthToken = 'no-token-defined';

    this.setBaseUrl = function(url) { baseURL = url; };
    this.getBaseUrl = function() { return baseURL; };

    this.setOauthToken = function(token) { oauthToken = token; };
    this.getOauthToken = function() { return oauthToken; };
    this.hasOauthToken = function() { return Boolean(oauthToken === undefined); };

    this.setErrorHandler = function(handler) { errorHandler = handler; };

    this.$get = function(Restangular, s3FileHelper,
                         Datasets, Dictionaries, Jobs, Modalities, Models, OauthTokens, OauthApplications,
                         PreparationRules, Projects, Reports, UserSettings, Sources, Uploads, Users, Variables) {
      var self = this;

      Restangular.setBaseUrl(this.getBaseUrl());
      Restangular.setDefaultHeaders({ accept: 'application/json', Authorization: 'Bearer ' + this.getOauthToken() });
      Restangular.setErrorInterceptor(function(response) { errorHandler(response); });
      Jobs.setErrorHandler(function(err) {
        err = {
          data: {
            message: err.message,
            status: err.status,
            errors: [err]
          },
          status: err.status
        };
        errorHandler(err);
      });
      Restangular.addResponseInterceptor(function(data, operation, what, url, response) {
        //operation is one of 'getList', 'post', 'get', 'patch'
        if (['getList', 'post', 'get', 'patch'].indexOf(operation) > -1) {
          //Any api response except 204 - No-Content is an object (wrapping either an object or an array)
          if(response.status !== 204) {
            // remove strong parameters : replace { tokens: [ {}, {}, ... ]} by [ {}, {}, ... ]
            var resourceName = Object.keys(response.data)[0];
            if (resourceName) {
              data = response.data[resourceName];
            }
          }
        }
        return data;
      });

      return {
        Datasets: Datasets,
        Dictionaries: Dictionaries,
        Jobs: Jobs,
        Modalities: Modalities,
        Models: Models,
        OauthTokens: OauthTokens,
        OauthApplications: OauthApplications,
        PreparationRules: PreparationRules,
        Projects: Projects,
        Reports: Reports,
        Sources: Sources,
        Uploads: Uploads,
        Users: Users,
        UserSettings: UserSettings,
        Variables: Variables,

        s3FileHelper: s3FileHelper,
        _restangular: Restangular,
        setOauthToken: function(token) {
          self.setOauthToken(token);
          Restangular.setDefaultHeaders({ accept: 'application/json', Authorization: token });
        },
        setErrorHandler: function(handler) {
          self.setErrorHandler(handler);
        }
      };
    };
  });

/**
 * @ngdoc service
 * @name predicsis.jsSDK.models.Datasets
 * @requires $q
 * @requires Restangular
 * @requires Jobs
 * @description
 * <table>
 *   <tr>
 *     <td><span class="badge post">post</span> <kbd>/datasets</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.models.Datasets#methods_create Datasets.create()}</kbd></td>
 *     <td><span class="badge async">async</span></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge post">post</span> <kbd>/datasets</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.models.Datasets#methods_split Datasets.split()}</kbd></td>
 *     <td><span class="badge async">async</span></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge get">get</span> <kbd>/datasets</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.models.Datasets#methods_all Datasets.all()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge get">get</span> <kbd>/datasets/:id</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.models.Datasets#methods_get Datasets.get()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge get">get</span><span class="badge get">get</span><span class="badge get">get</span></td>
 *     <td><kbd>{@link predicsis.jsSDK.models.Datasets#methods_getchildren Datasets.getChildren()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge patch">patch</span> <kbd>/datasets/:id</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.models.Datasets#methods_update Datasets.update()}</kbd></td>
 *     <td><span class="badge async">async</span></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge delete">delete</span> <kbd>/datasets/:id</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.models.Datasets#methods_delete Datasets.delete()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tr>
 *     <td>Tells if a dataset has subsets</td>
 *     <td colspan="2"><kbd>{@link predicsis.jsSDK.models.Datasets#methods_hasChildren Jobs.hasChildren()}</kbd></td>
 *   </tr>
 *   <tr>
 *     <td>Tells if a dataset is a parent dataset</td>
 *     <td colspan="2"><kbd>{@link predicsis.jsSDK.models.Datasets#methods_isParent Jobs.isParent()}</kbd></td>
 *   </tr>
 *   <tr>
 *     <td>Tells if a dataset is a child dataset</td>
 *     <td colspan="2"><kbd>{@link predicsis.jsSDK.models.Datasets#methods_isChild Jobs.isChild()}</kbd></td>
 *   </tr>
 *   <tr>
 *     <td>Tells if a dataset is a train subset</td>
 *     <td colspan="2"><kbd>{@link predicsis.jsSDK.models.Datasets#methods_isTrainPart Jobs.isTrainPart()}</kbd></td>
 *   </tr>
 *   <tr>
 *     <td>Tells if a dataset is a test subset</td>
 *     <td colspan="2"><kbd>{@link predicsis.jsSDK.models.Datasets#methods_isTestPart Jobs.isTestPart()}</kbd></td>
 *   </tr>
 *   <tr>
 *     <td>Tells if a dataset has both header and separator defined</td>
 *     <td colspan="2"><kbd>{@link predicsis.jsSDK.models.Datasets#methods_isFormatted Jobs.isFormatted()}</kbd></td>
 *   </tr>
 *   <tr>
 *     <td>Tells if a dataset is the result of a score</td>
 *     <td colspan="2"><kbd>{@link predicsis.jsSDK.models.Datasets#methods_isScore Jobs.isScore()}</kbd></td>
 *   </tr>
 *   <tfoot>
 *   <tr><td colspan="3">Official documentation is available at https://developer.predicsis.com/doc/v1/data_management/dataset/</td></tr>
 *   </tfoot>
 * </table>
 *
 * A dataset may have various differents states:
 *
 * <h3>Learning dataset (just after upload)</h3>
 * <pre>
 *   {
 *     id: 'learning_dataset',
 *     created_at: '2014-12-14T15:09:08.112Z',
 *     updated_at: '2014-12-14T15:08:57.970Z',
 *     name: 'Learning dataset',
 *     header: null,
 *     separator: null,
 *     user_id: '541b06dc617070006d060000',
 *     source_ids: ['54904b136170700007330000'],
 *     parent_dataset_id: null,
 *     sampling: 100,
 *     nb_of_lines: 50002,
 *     children_dataset_ids: [],
 *     dictionary_ids: [],
 *     generated_dictionaries_ids: [],
 *     data_file: {
 *       id: '54904b09776f720001650000',
 *       filename: 'learning-dataset.csv',
 *       type: 'S3',
 *       size: 538296,
 *       url: S3_URL + '/download/file/from/s3/learning-dataset.csv'
 *     },
 *     main_modality: null,
 *     classifier_id: null,
 *     dataset_id: null,
 *     job_ids: ['54904b146170700007360000'],
 *     preview: [
 *       '...\t...\t...',
 *       '...\t...\t...',
 *       '...\t...\t...',
 *       '...\t...\t...',
 *       '...\t...\t...'
 *     ]
 *   }
 * </pre>
 *
 * <h3>Splitted learning dataset -> learned part (see {@link predicsis.jsSDK.models.Datasets#methods_istrainpart Datasets.isTrainPart(Dataset dataset)})</h3>
 * <pre>
 *   {
 *     ...
 *     source_ids: [],
 *     parent_dataset_id: 'learning_dataset_with_model',
 *     sampling: 70,
 *     nb_of_lines: null,
 *     preview: null
 *     ...
 *   }
 * </pre>
 *
 * <h3>Splitted learning dataset -> tested part (see {@link predicsis.jsSDK.models.Datasets#methods_istestpart Datasets.isTestPart(Dataset dataset)})</h3>
 * <pre>
 *   {
 *     ...
 *     source_ids: [],
 *     parent_dataset_id: 'learning_dataset_with_model',
 *     sampling: -70,
 *     nb_of_lines: null,
 *     preview: null
 *     ...
 *   }
 * </pre>
 *
 * <h3>After model generation</h3>
 * <pre>
 *   {
 *     ...
 *     generated_dictionaries_ids: ['parent_dictionary'],
 *     children_dataset_ids: ['learned_learning_dataset', 'tested_learning_dataset'],
 *     job_ids: [
 *       '54904bfe6170700007930000',
 *       '54904bf961707000078c0000',
 *       '54904b146170700007360000',
 *       '54904ce06170700007d10000'
 *     ]
 *     ...
 *   }
 * </pre>
 *
 * <h3>Scoring dataset</h3>
 * <pre>
 *   {
 *     ...
 *     source_ids: ['54904da06170700007df0000'],
 *     generated_dictionaries_ids: [],
 *     children_dataset_ids: [],
 *     ...
 *   }
 * </pre>
 *
 * <h3>Scoreset (see {@link predicsis.jsSDK.models.Datasets#methods_isScore Datasets.isScore(Dataset dataset)})</h3>
 * <pre>
 *   {
 *     ...
 *     classifier_id: '5436431070632d15f4260000',
 *     dataset_id: 'scoring_dataset',
 *     modalities_set_id: '53fdfa7070632d0fc5030000',
 *     ...
 *   }
 * </pre>
 *
 * Please also note that there is no distinction between a learning dataset and a scoring dataset.
 */
angular
  .module('predicsis.jsSDK.models')
  .service('Datasets', function($q, Restangular, Jobs) {
    'use strict';
    var self = this;

    function dataset(id) { return Restangular.one('datasets', id); }
    function datasets() { return Restangular.all('datasets'); }

    // -----------------------------------------------------------------------------------------------------------------

    /**
     * @ngdoc function
     * @name create
     * @methodOf predicsis.jsSDK.models.Datasets
     * @description Create a dataset from a source
     *  <h4>Basic dataset creation</h4>
     *  <pre>
     *  {
     *    name:       'My awesome dataset',
     *    source_ids: ['original_source_id'],
     *    header:     true,
     *    separator:  '\t',
     *    data_file:  { filename: 'source.csv' }
     *  }
     *  </pre>
     *
     *  Only <code>name</code> and <code>source_ids</code> are required.
     *
     *  <h4>Scoring a file regarding to an existing model</h4>
     *  <pre>
     *  {
     *    name:              'My awesome dataset',
     *    classifier_id:     $classifier_id$,
     *    dataset_id:        $dataset_id$,
     *    modalities_set_id: $modalities_set_id$,
     *    main_modality:     $main_modality$,
     *    separator:         $separator$,
     *    header:            $header$,
     *    data_file:         { filename: $name$ }
     *  }
     *  </pre>
     *
     * @param {Object} params See above description
     * @return {Promise} New dataset or new scoreset
     */
    this.create = function(params) {
      return Jobs.wrapAsyncPromise(datasets().post({dataset: params}))
        .then(function(result) {
          return dataset(result.id).get();
        });
    };

    /**
     * @ngdoc function
     * @name split
     * @methodOf predicsis.jsSDK.models.Datasets
     * @description Split a dataset into subsets according to <code>smapling</code> ratio.
     *  <b>Note:</b>
     *  <ul>
     *    <li>Learning subset will be named <code>learned_#dataset_name#</code>
     *    <li>Testing subset will be named <code>tested_#dataset_name#</code>
     *    <li>Idem for learning/testing filenames</li>
     *  </ul>
     *
     * @param {String} id            Dataset id you want to split (called <em>original dataset</em>)
     * @param {String} name          Name of the original dataset (used to name its subsets)
     * @param {String} filename      Name of the original datafile (used to name its subsets's datafile)
     * @param {Number} [sampling=70] Examples: If you set <code>sampling</code> to 70, you are going to have:
     * <ul>
     *   <li><code>70%</code> of your original dataset for <b>learning</b></li>
     *   <li><code>30%</code> of your original dataset for <b>testing</b></li>
     * </ul><br/>
     * @return {Promise} Subsets
     */
    this.split = function(id, name, filename, sampling) {
      sampling = sampling || 70;
      var learn = {
        parent_dataset_id: id,
        name: 'learned_' +  name,
        data_file: {filename: 'learned_' + filename},
        sampling: sampling
      };

      var test = {
        parent_dataset_id: id,
        name: 'tested_' + name,
        data_file: {filename: 'tested_' + filename},
        sampling: -sampling
      };

      return $q.all([this.create(learn), this.create(test)]);
    };

    /**
     * @ngdoc function
     * @name all
     * @methodOf predicsis.jsSDK.models.Datasets
     * @description Get all (or a list of) datasets
     *
     * @param {Array} [ids] List of datasets' id you want to fetch
     * @return {Promise} List of datasets
     */
    this.all = function(ids) {
      if(ids === undefined) {
        return datasets().getList();
      } else {
        ids = ids || [];

        return $q.all(ids.map(function(id) {
          return dataset(id).get();
        }));
      }
    };

    /**
     * @ngdoc function
     * @name get
     * @methodOf predicsis.jsSDK.models.Datasets
     * @description Get a single dataset by its id
     *
     * @param {String} id Dataset identifier
     * @return {Promise} Requested dataset
     */
    this.get = function(id) {
      return dataset(id).get();
    };

    /**
     * @ngdoc function
     * @name getChildren
     * @methodOf predicsis.jsSDK.models.Datasets
     * @description Get learning/testing subsets of an original dataset
     * <div><span class="badge get">get</span><code>/datasets</code></div>
     * <div><span class="badge get">get</span><code>/datasets/:learned_dataset_id</code></div>
     * <div><span class="badge get">get</span><code>/datasets/:tested_dataset_id</code></div>
     *
     * @param {String} id Identifier of an original dataset
     * @return {Promise}
     * <ul>
     *   <li><code>children.train</code>: learning dataset</li>
     *   <li><code>children.test</code>: testing dataset</li>
     * </ul>
     */
    this.getChildren = function(id) {
      return self.get(id)
        .then(function(originalDataset) {
          return self.all(originalDataset.children_dataset_ids);
        })
        .then(function(subsets) {
          return subsets.reduce(function(memo, child) {
            if (child.sampling > 0) {
              memo.train = child;
            } else {
              memo.test = child;
            }

            return memo;
          }, {});
        });
    };

    /**
     * @ngdoc function
     * @name update
     * @methodOf predicsis.jsSDK.models.Datasets
     * @description Update specified dataset
     *  You can update the following parameters:
     *  <ul>
     *    <li><code>{String} name</code></li>
     *    <li><code>{Boolean} header</code></li>
     *    <li><code>{String} separator</code></li>
     *  </ul>
     *
     *  If a <code>separator</code> is updated, this function also escape this string because there is a paradox:
     *  <ul>
     *    <li>
     *      The API requires a separator like "\t".<br/>
     *      To do so, the separator sent in the request must be "\\t".
     *    </li>
     *    <li>
     *      The view requires a tabulation to be able to build the preview.<br/>
     *      To do so, the separator given to the preview method must be "\t".
     *    </li>
     *  </ul>
     *
     * @param {String} id Id of the dictionary you want to update
     * @param {Object} changes see above description to know parameters you are able to update
     * @return {Promise} Updated dataset
     */
    this.update = function(id, changes) {
      if (changes.separator && changes.separator === '\t') {
        changes.separator = '\\t';
      }

      return Jobs.wrapAsyncPromise(dataset(id).patch({dataset: changes}))
        .then(function(result) {
          return dataset(result.id).get();
        });
    };

    /**
     * @ngdoc function
     * @name delete
     * @methodOf predicsis.jsSDK.models.Datasets
     * @description Permanently destroy a specified dataset
     * @param {String} id Id of the dataset you want to remove
     * @return {Promise} Removed dataset
     */
    this.delete = function(id) {
      return dataset(id).remove();
    };

    // -----------------------------------------------------------------------------------------------------------------

    /**
     * @ngdoc function
     * @methodOf predicsis.jsSDK.models.Datasets
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
     * @methodOf predicsis.jsSDK.models.Datasets
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
     * @methodOf predicsis.jsSDK.models.Datasets
     * @name isChild
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
     * @methodOf predicsis.jsSDK.models.Datasets
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
     * @methodOf predicsis.jsSDK.models.Datasets
     * @name isTestPart
     * @description Tells if a dataset is a test subset.
     * <b>Note:</b> A dataset is considered as a test subset if its sampling is negative
     * @param {Object} dataset Instance of {@link predicsis.jsSDK.models.Datasets dataset}
     * @return {Boolean} <kbd>true</kbd> / <kbd>false</kbd>
     */
    this.isTestPart = function(dataset) {
      return this.isChild(dataset) && dataset.sampling < 0;
    };

    /**
     * @ngdoc function
     * @methodOf predicsis.jsSDK.models.Datasets
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
     * @methodOf predicsis.jsSDK.models.Datasets
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

/**
 * @ngdoc service
 * @name predicsis.jsSDK.models.Dictionaries
 * @requires $q
 * @requires Restangular
 * @requires Jobs
 * @description
 * <table>
 *   <tr>
 *     <td><span class="badge post">post</span> <kbd>/dictionaries</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.models.Dictionaries#methods_create Dictionaries.create()}</kbd></td>
 *     <td><span class="badge async">async</span></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge post">post</span> <kbd>/dictionaries</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.models.Dictionaries#methods_createFromDataset Dictionaries.createFromDataset()}</kbd></td>
 *     <td><span class="badge async">async</span></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge get">get</span> <kbd>/dictionaries</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.models.Dictionaries#methods_all Dictionaries.all()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge get">get</span> <kbd>/dictionaries/:id</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.models.Dictionaries#methods_get Dictionaries.get()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge patch">patch</span> <kbd>/dictionaries/:id</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.models.Dictionaries#methods_update Dictionaries.update()}</kbd></td>
 *     <td><span class="badge async">async</span></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge delete">delete</span> <kbd>/dictionaries/:id</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.models.Dictionaries#methods_delete Dictionaries.delete()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tfoot>
 *   <tr><td colspan="3">Official documentation is available at https://developer.predicsis.com/doc/v1/dictionary</td></tr>
 *   </tfoot>
 * </table>
 *
 * Output example:
 * <pre>
 * {
 *   id: "5492e2b1617070000b1d0000",
 *   created_at: "2014-12-18T14:20:33.982Z",
 *   updated_at: "2014-12-18T14:20:22.872Z",
 *   name: "dictionary_iris.csv",
 *   description: null,
 *   user_id: "541b06dc617070006d060000",
 *   dataset_id: null,
 *   dataset_ids: [],
 *   variable_ids: [
 *     "5492e2a6776f720001000500",
 *     "5492e2a6776f720001010500",
 *     "5492e2a6776f720001020500",
 *     "5492e2a6776f720001030500",
 *     "5492e2a6776f720001040500"
 *   ],
 *   job_ids: ["5492e2b1617070000b1e0000"]
 * }
 * </pre>
 */
angular
  .module('predicsis.jsSDK.models')
  .service('Dictionaries', function($q, Restangular, Jobs) {
    'use strict';

    function dictionary(id) { return Restangular.one('dictionaries', id); }
    function dictionaries() { return Restangular.all('dictionaries'); }

    // -----------------------------------------------------------------------------------------------------------------

    /**
     * @ngdoc function
     * @name createFromDataset
     * @methodOf predicsis.jsSDK.models.Dictionaries
     * @description Create a dictionary from an existing dataset.
     * @param {Object} dataset We need a dataset to generate a dictionary, and especially the following information:
     * - <code>dataset.name</code> to name the dictionary like: <code>"dictionary_#{name}"</code>
     * - <code>dataset.id</code>
     * @return {Object} Promise of a new dictionary
     */
    this.createFromDataset = function(dataset) {
      return this.create({
        name: encodeURI('dictionary_' + dataset.name.toLowerCase()),
        dataset_id: dataset.id
      });
    };

    //this.clone = function(dictionary) {
    //
    //};

    // -----------------------------------------------------------------------------------------------------------------

    /**
     * @ngdoc function
     * @name create
     * @methodOf predicsis.jsSDK.models.Dictionaries
     * @description Send POST request to the <code>dictionary</code> API resource.
     *  This request is going to generate a dictionary regarding to a given dataset. This generation is delegated to
     *  ML core tool. That's why this request is asynchronous.
     *
     *  You can give the following parameters to ask for dictionary generation:
     *  <pre>
     *  {
     *    dataset_id: "53c7dea470632d3417020000",
     *    name:       "Dictionary of my awesome dataset"
     *  }
     *  </pre>
     *
     * @param {Object} params See above example.
     * @return {Object} Promise of a new dictionary
     */
    this.create = function(params) {
      return Jobs.wrapAsyncPromise(dictionaries().post({dictionary: params}))
        .then(function(result) {
          return dictionary(result.id).get();
        });
    };

    /**
     * @ngdoc function
     * @name all
     * @methodOf predicsis.jsSDK.models.Dictionaries
     * @description Get all (or a list of) generated dictionaries
     * @param {Array} [dictionaryIds] List of dictionaries's id you want to fetch
     * @return {Object} Promise of a dictionaries list
     */
    this.all = function(dictionaryIds) {
      if(dictionaryIds === undefined) {
        return dictionaries(dictionaryIds).getList();
      } else {
        dictionaryIds = dictionaryIds || [];

        return $q.all(dictionaryIds.map(function(id) {
          return dictionary(id).get();
        }));
      }
    };

    /**
     * @ngdoc function
     * @name get
     * @methodOf predicsis.jsSDK.models.Dictionaries
     * @description Get a single dictionary by its id
     * @param {String} dictionaryId Dictionary identifier
     * @return {Object} Promise of a dictionary
     */
    this.get = function(dictionaryId) {
      return dictionary(dictionaryId).get();
    };

    /**
     * @ngdoc function
     * @name update
     * @methodOf predicsis.jsSDK.models.Dictionaries
     * @description Update specified dictionary
     *  You can update the following parameters:
     *  <ul>
     *    <li><code>{String} name</code></li>
     *    <li><code>{String} description</code> (max. 250 characters)</li>
     *  </ul>
     *
     * @param {String} dictionaryId Id of the dictionary you want to update
     * @param {Object} changes see above description to know parameters you are able to update
     * @return {Object} Promise of the updated dictionary
     */
    this.update = function(dictionaryId, changes) {
      return Jobs.wrapAsyncPromise(dictionary(dictionaryId).patch({dictionary: changes}))
        .then(function(result) {
          return dictionary(result.id).get();
        });
    };

    /**
     * @ngdoc function
     * @name delete
     * @methodOf predicsis.jsSDK.models.Dictionaries
     * @description Permanently destroy a specified dictionary
     * @param {String} dictionaryId Id of the dictionary you want to remove
     * @return {Object} Promise of an empty dictionary
     */
    this.delete = function(dictionaryId) {
      return dictionary(dictionaryId).remove();
    };

  });

/**
 * @ngdoc service
 * @name predicsis.jsSDK.models.Jobs
 * @requires $q
 * @requires Restangular
 * @description
 * A lot of requests on PredicSis API are asynchronous. That means when you send a <kbd>POST /datasets</kbd>
 * request (for example), you will get a 201 Created HTTP response. A new <kbd>dataset</kbd> has been created.
 * <b>BUT</b> it hasn't been completely fulfilled, there is a pending job you must wait for its termination to
 * consider the <kbd>dataset</kbd> really created.
 *
 * Each time the API returns a <kbd>job_ids</kbd> in a response, the request is asynchronous. This array
 * contains all the jobs created before and the current one in the last position. You have to send a
 * <kbd>GET /jobs/:jobId</kbd> request and check the <kbd>status</kbd> property. It could take 4 values:
 * <ul>
 *   <li>pending</li>
 *   <li>processing</li>
 *   <li>completed</li>
 *   <li>failed</li>
 * </ul>
 *
 * The following schema shows a job' standard workflow:
 * <img src="https://github.com/PredicSis/kml-api-doc/blob/master/assets/img/job_status.png" alt="Job standard workflow" />
 *
 * <table>
 *   <tr>
 *     <td><span class="badge get">get</span> <kbd>/jobs</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.models.Jobs#methods_all Jobs.all()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge get">get</span> <kbd>/jobs/:id</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.models.Jobs#methods_get Jobs.get()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge delete">delete</span> <kbd>/jobs/:id</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.models.Jobs#methods_delete Jobs.delete()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tr>
 *     <td>Active pulling on a job waiting for its termination</td>
 *     <td colspan="2"><kbd>{@link predicsis.jsSDK.models.Jobs#methods_listen Jobs.listen()}</kbd></td>
 *   </tr>
 *   <tr>
 *     <td>Transform an async promise into the same promise resolving only when job is completed</td>
 *     <td colspan="2"><kbd>{@link predicsis.jsSDK.models.Jobs#methods_wrapAsyncPromise Jobs.wrapAsyncPromise()}</kbd></td>
 *   </tr>
 *   <tr>
 *     <td>Defines function called when a jobs fails</td>
 *     <td colspan="2"><kbd>{@link predicsis.jsSDK.models.Jobs#methods_setErrorHandler Jobs.setErrorHandler()}</kbd></td>
 *   </tr>
 *   <tfoot>
 *   <tr><td colspan="3">Official documentation is available at https://developer.predicsis.com/doc/v1/job</td></tr>
 *   </tfoot>
 * </table>
 *
 * Output example:
 * <pre>
 *   {
 *     id: "53c7ded570632d3417050000",
 *     action: "Generate dictionary",
 *     status: "completed",
 *     error: null,
 *     warnings: null,
 *     created_at: "2014-05-02T15:42:51.687Z",
 *     started_at: "2014-05-02T15:42:52.687Z",
 *     finished_at: "2014-05-02T15:52:51.687Z",
 *     user_id: "5363b25c687964476d000000",
 *     runnable_id: "5363b7fc6879644ae7010000"
 *   }
 * </pre>
 *
 * <b>Important notes:</b>
 * A <kbd>GET /gobs/:jobId</kbd> is going to return a <kbd>200 OK</kbd> even if its <kbd>error</kbd> or
 * <kbd>warning</kbd> aren't null! So don't forget to take a look on it!
 */
angular
  .module('predicsis.jsSDK.models')
  .service('Jobs', function($q, Restangular) {
    'use strict';

    var self = this;
    var errorHandler;

    function job(id) { return Restangular.one('jobs', id); }
    function jobs() { return Restangular.all('jobs'); }

    // -----------------------------------------------------------------------------------------------------------------

    /**
     * @ngdoc function
     * @name all
     * @methodOf predicsis.jsSDK.models.Jobs
     * @description Get all (or a list of) async job
     * @param {Array} [jobIds] List of job id you want to fetch
     * @return {Object} Promise of a job list
     */
    this.all = function(jobIds) {
      if(jobIds === undefined) {
        return jobs(jobIds).getList();
      } else {
        jobIds = jobIds || [];

        return $q.all(jobIds.map(function(id) {
          return job(id).get();
        }));
      }
    };

    /**
     * @ngdoc function
     * @name get
     * @methodOf predicsis.jsSDK.models.Jobs
     * @description Get a single job by its id
     * @param {String} jobId Job identifier
     * @return {Object} Promise of a job
     */
    this.get = function(jobId) {
      return job(jobId).get();
    };

    /**
     * @ngdoc function
     * @name delete
     * @methodOf predicsis.jsSDK.models.Jobs
     * @description Permanently destroy a specified job
     * @param {String} jobId Id of the job you want to remove
     * @return {Object} Promise of an empty job
     */
    this.delete = function(jobId) {
      return job(jobId).remove();
    };

    // -----------------------------------------------------------------------------------------------------------------

    /**
     * @ngdoc function
     * @methodOf predicsis.jsSDK.models.Jobs
     * @name listen
     * @description Active pulling on a job waiting for its termination
     *
     * <b>Important notes:</b>
     * <ul>
     *   <li>You can <em>listen</em>only one job at a time</li>
     *   <li>a <kbd>GET /jobs/:jobId</kbd> is going to be sent every 3 second the first minute, and every minute after</li>
     * </ul>
     *
     * @param {String} jobId The id of the job api resource you want to wait termination
     * @return {Promise} A promise resolved only when the job succeeds
     */
    this.listen = function(jobId) {

      var deferred = $q.defer();
      var isRequestPending = false;   //Lock limiting interval loop to one concurrent request
      var requestCounter = 0;         //Counter to manage timeout step (3 seconds the 1st minute, one minute after)

      //Store intervalId as a closure to be able to stop interval loop
      var intervalId = window.setInterval(function() {
        //Limit to one concurrent request
        if(!isRequestPending) {

          isRequestPending = true;
          requestCounter++;

          self.get(jobId).then(function(job) {
            if (job.status === 'failed') {
              //reject promise if status is failed (and stop interval loop)
              clearInterval(intervalId);
              var error = new Error(job.error.message);
              error.status = job.error.status;
              deferred.reject(error);

            } else if (job.status === 'completed') {

              //resolve promise if status is completed (and stop interval loop)
              clearInterval(intervalId);
              deferred.resolve(jobId);

            } else {

              //continue interval calls otherwise (wait timeout seconds before accepting new request)
              var timeout = 60;   //Job is pulled each minute (except 1st minute)
              //Job is pulled each 3 seconds during the 1st minute (for fast jobs)
              if(requestCounter < 20) {
                timeout = 3;
              }
              //Unlock request Lock after timeout seconds
              window.setTimeout(function() {
                isRequestPending = false;
              }, timeout * 1000);
            }
          })
            //catch request errors, reject promise and stop interval loop
            .then(null, function(error) {
              clearInterval(intervalId);
              deferred.reject(error);
            });
        }
      }, 1000);

      return deferred.promise;
    };

    /**
     * @ngdoc function
     * @methodOf predicsis.jsSDK.models.Jobs
     * @name wrapAsyncPromise
     * @description Transform an async promise into the same promise resolving only when job is completed
     *
     * Usage example:
     * <pre>
     * return Jobs
     *   .wrapAsyncPromise(datasets().post({dataset: params}))
     *   .then(function(dataset) {
     *     // do something with you completely created new dataset
     *     // ...
     *   });
     * </pre>
     *
     * @param {Promise|Array} promise or list of jobs (the last one will be listened)
     * @return {Promise} See above example
     */
    this.wrapAsyncPromise = function(promise) {
      return promise.then(function(asyncResult) {
        var jobId = (asyncResult.job_ids || []).slice(-1)[0];
        return self.listen(jobId)
          .then(function() {
            return asyncResult;
          })
          .catch(function(err) {
            if(errorHandler) {
              errorHandler(err);
            }
            throw err;
          });
      });
    };

    /**
     * @ngdoc function
     * @methodOf predicsis.jsSDK.models.Jobs
     * @name setErrorHandler
     * @description set error handler (errors occuring in a job)
     *
     * Usage example:
     * <pre>
     * return Jobs
     *   .setErrorHandler(function(error) {
     *     // do something with error
     *     // ...
     *   });
     * </pre>
     *
     * @param {Function} callback called when an error occurs during a Job
     */
    this.setErrorHandler = function(cb) {
      errorHandler = cb;
    };

  });

/**
 * @ngdoc service
 * @name predicsis.jsSDK.models.Modalities
 * @requires $q
 * @requires Restangular
 * @requires Jobs
 * @description
 * <table>
 *   <tr>
 *     <td><span class="badge post">post</span> <kbd>/modalities_sets</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.models.Modalities#methods_create Modalities.create()}</kbd></td>
 *     <td><span class="badge async">async</span></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge get">get</span> <kbd>/modalities_sets</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.models.Modalities#methods_all Modalities.all()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge get">get</span> <kbd>/modalities_sets/:id</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.models.Modalities#methods_get Modalities.get()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge delete">delete</span> <kbd>/modalities_sets/:id</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.models.Modalities#methods_delete Modalities.delete()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tfoot>
 *     <tr><td colspan="3">Official documentation is available at https://developer.predicsis.com/doc/v1/dictionary/modalities/</td></tr>
 *   </tfoot>
 * </table>
 */
angular
  .module('predicsis.jsSDK.models')
  .service('Modalities', function($q, Restangular, Jobs) {
    'use strict';

    function modality(id) { return Restangular.one('modalities_sets', id); }
    function modalities() { return Restangular.all('modalities_sets'); }

    // -----------------------------------------------------------------------------------------------------------------

    /**
     * @ngdoc function
     * @name create
     * @methodOf predicsis.jsSDK.models.Modalities
     * @description Send POST request to the <code>modalities_sets</code> API resource.
     *
     *  You can / must give the following parameters to ask for a modalities set creation:
     *  <pre>
     *  {
     *    variable_id: "5329601c1757f446e6000002"
     *    dataset_id:  "53c7dea470632d3417020000",
     *  }
     *  </pre>
     *
     *  Both <code>variable_id</code> and <code>dataset_id</code> are required.
     *
     * @param {Object} params See above example.
     * @return {Promise} Returned modalities set does not contain modalities themselves.
     * If you want them, you must explicitly {@link predicsis.jsSDK.models.Modalities#methods_get get} them.
     * In fact, you will get an object like:
     * <pre>
     *   {
     *     id": "53fdfa7070632d0fc5030000",
     *     created_at: "2014-05-02T17:13:56.687Z",
     *     user_id: "5363b25c687964476d000000",
     *     dataset_id: "53c7dea470632d3417020000",
     *     variable_id: "5329601c1757f446e6000002",
     *     job_ids: [ "53c8c88970632d3b9a030001" ]
     *   }
     * </pre>
     */
    this.create = function(params) {
      return Jobs.wrapAsyncPromise(modalities().post({modalities_set: params}))
        .then(function(result) {
          return modality(result.id).get();
        });
    };

    /**
     * @ngdoc function
     * @name all
     * @methodOf predicsis.jsSDK.models.Modalities
     * @description Get all (or a list of) generated modalities sets
     * @param {Array} [modalitiesSetIds] List of modalities sets ids you want to fetch
     * @return {Promise} A list of modalities sets
     */
    this.all = function(modalitiesSetIds) {
      if(modalitiesSetIds === undefined) {
        return modalities().getList();
      } else {
        modalitiesSetIds = modalitiesSetIds || [];

        return $q.all(modalitiesSetIds.map(function(id) {
          return modality(id).get();
        }));
      }
    };

    /**
     * @ngdoc function
     * @name get
     * @methodOf predicsis.jsSDK.models.Modalities
     * @description Get a single modalities set by its id
     * @param {String} id Modalities set identifier
     * @return {Promise} A modalities set
     */
    this.get = function(id) {
      return modality(id).get();
    };

    /**
     * @ngdoc function
     * @name delete
     * @methodOf predicsis.jsSDK.models.Modalities
     * @description Permanently destroy a specified source
     * @param {String} id Id of the source you want to remove
     * @return {Promise} A removed source
     */
    this.delete = function(id) {
      return modality(id).remove();
    };

  });

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

/**
 * @ngdoc service
 * @name predicsis.jsSDK.models.OauthApplications
 * @requires Restangular
 * @description
 * <table>
 *   <tr>
 *     <td><span class="badge post">post</span> <kbd>/settings/applications</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.models.OauthApplications#methods_create OauthApplications.create()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge get">get</span> <kbd>/settings/applications</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.models.OauthApplications#methods_all OauthApplications.all()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge get">get</span> <kbd>/settings/applications/:token_id</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.models.OauthApplications#methods_get OauthApplications.get()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge patch">patch</span> <kbd>/settings/applications/:token_id</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.models.OauthApplications#methods_update OauthApplications.update()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge delete">delete</span> <kbd>/settings/applications/:token_id</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.models.OauthApplications#methods_delete OauthApplications.delete()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tfoot>
 *     <tr><td colspan="3">Official documentation is available at:
 *       <ul>
 *         <li>https://developer.predicsis.com/doc/v1/overview/oauth2/</li>
 *       </td></tr>
 *   </tfoot>
 * </table>
 *
 * Output example:
 * <pre>
 *   {
 *     application: {
 *       id: "540778b5353834003e050000",
 *       name: "essai",
 *       uid: "829b6d53ac27d6cf9670725eb22288dd3914d4d3a811b0d036fd5eb2bc275540",
 *       secret: "e7a9d71fbcd0e0f4f1a78b7dbbd8311d91517ca0ee1d74594db11b6a60a13732",
 *       redirect_uri: "http://truc.bidule",
 *       owner_id: "540762703263310008000000",
 *       created_at: "2014-09-03T20:23:17.025Z",
 *       updated_at: "2014-09-03T20:23:17.025Z"
 *     }
 *   }
 * </pre>
 */
angular
  .module('predicsis.jsSDK.models')
  .service('OauthApplications', function(Restangular) {
    'use strict';

    function settings() { return Restangular.all('settings'); }
    function applications() { return settings().all('applications'); }

    // -----------------------------------------------------------------------------------------------------------------

    /**
     * @ngdoc function
     * @name create
     * @methodOf predicsis.jsSDK.models.OauthApplications
     * @description Create a new Oauth application
     * @param {String} name Your application's name
     * @param {String} redirectURI The URL in your app where users will be sent after authorization
     * @return {Object} A new and ready-to-use Oauth application
     * <pre>
     * {
     *   application: {
     *     id: "540778b5353834003e050000",
     *     name: "essai",
     *     uid: "829b6d53ac27d6cf9670725eb22288dd3914d4d3a811b0d0365...",
     *     secret: "e7a9d71fbcd0e0f4f1a78b7dbbd8311d91517ca0ee1d74594db...",
     *     redirect_uri: "http://truc.bidule",
     *     owner_id: "540762703263310008000000",
     *     created_at: "2014-09-03T20:23:17.025Z",
     *     updated_at: "2014-09-03T20:23:17.025Z"
     *   }
     * }
     * </pre>
     */
    this.create = function(name, redirectURI) {
      return applications().post({application: {name: name, redirect_uri: redirectURI}});
    };

    /**
     * @ngdoc function
     * @name all
     * @methodOf predicsis.jsSDK.models.OauthApplications
     * @return {Object} List of all active applications
     * <pre>{ applications: [ {...}, {...}, {...} ] }</pre>
     */
    this.all = function() {
      return applications().getList();
    };

    /**
     * @ngdoc function
     * @name get
     * @methodOf predicsis.jsSDK.models.OauthApplications
     * @return {Object} Requested application (if exists, 404 otherwise)
     * <pre>{ application: {...} }</pre>
     */
    this.get = function(appId) {
      return settings().one('applications', appId).get();
    };

    /**
     * @ngdoc function
     * @name update
     * @methodOf predicsis.jsSDK.models.OauthApplications
     * @param {String} appId Identifier of the application you want to update
     * @param {Object} changes List of changes you want to save. You can act on the following parameters:
     * <ul>
     *   <li>name</li>
     *   <li>redirect_uri</li>
     * </ul>
     * @return {Object} Updated application
     * <pre>{ application: {...} }</pre>
     */
    this.update = function(appId, changes) {
      return settings().one('applications', appId).patch({application: changes});
    };

    /**
     * @ngdoc function
     * @name delete
     * @methodOf predicsis.jsSDK.models.OauthApplications
     * @description Revoke an application (returns a 204 No-Content)
     */
    this.delete = function(appId) {
      return settings().one('applications', appId).remove();
    };

  });

/**
 * @ngdoc service
 * @name predicsis.jsSDK.models.OauthTokens
 * @requires Restangular
 * @description
 * <table>
 *   <tr>
 *     <td><span class="badge post">post</span> <kbd>/settings/tokens</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.models.OauthTokens#methods_create OauthTokens.create()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge get">get</span> <kbd>/settings/tokens</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.models.OauthTokens#methods_all OauthTokens.all()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge get">get</span> <kbd>/settings/tokens/:token_id</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.models.OauthTokens#methods_get OauthTokens.get()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge delete">delete</span> <kbd>/settings/tokens/:token_id</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.models.OauthTokens#methods_delete OauthTokens.delete()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tfoot>
 *     <tr><td colspan="3">Official documentation is available at:
 *       <ul>
 *         <li>https://developer.predicsis.com/doc/v1/overview/acces_tokens/</li>
 *       </td></tr>
 *   </tfoot>
 * </table>
 */
angular
  .module('predicsis.jsSDK.models')
  .service('OauthTokens', function(Restangular) {
    'use strict';

    function settings() { return Restangular.all('settings'); }
    function tokens() { return settings().all('tokens'); }

    // -----------------------------------------------------------------------------------------------------------------

    /**
     * @ngdoc function
     * @name create
     * @methodOf predicsis.jsSDK.models.OauthTokens
     * @description Create a new personal token.
     *
     * There are 2 things important to know about these tokens:
     * <ul>
     *   <li>They have no expiration date, thus you should avoid keeping an API token that is not used and try change them as often as possible.</li>
     *   <li>This creation request is the only one which displays the token</li>
     * </ul>
     *
     * JSON response for creating new tokens is a bit different from reteive action. It's mainly due to the fact that we
     * give real token only in this function.
     *
     * <pre>
     * {
     *   access_tokens: {
     *     id: "55353df361707000013c0300",
     *     token: "072ac0f1ced442f8c7ec4225e4546819bf8c9c2b8a77c8aebc057748d4ae7a64",
     *     name: "Token for my personal application over Predicsis API",
     *     created_at: "2015-04-20T17:57:07.976Z",
     *     updated_at: "2015-04-20T17:57:07.976Z"
     *   }
     * }
     * </pre>
     *
     * Right after your token creation, you can use it by setting the Authorization header like:
     * <pre>Authorization: Bearer ${new_token}</pre>
     *
     * @param {String} name Give an explicit name for your token
     * @return {Object} Be aware that you can't get your token again.
     */
    this.create = function(name) {
      return tokens().post({token: {name: name}});
    };

    /**
     * @ngdoc function
     * @name all
     * @methodOf predicsis.jsSDK.models.OauthTokens
     * @description Get the list of created and valid tokens
     *
     * Please note that tokens don't appears. They are only available after their creation.
     *
     * @return {Object}
     * <pre>
     * {
     *   tokens: [
     *     {
     *       id: "5409cc5f69702d0007180000",
     *       created_at: "2014-09-05T14:44:47.172Z",
     *       updated_at: "2014-09-05T14:44:47.172Z"
     *     },
     *     {
     *       id: "55353df361707000013c0300",
     *       created_at: "2015-04-20T17:57:07.976Z",
     *       updated_at: "2015-04-20T17:57:07.976Z"
     *     },
     *     {
     *       id: "55353e3761707000013d0300",
     *       created_at: "2015-04-20T17:58:15.454Z",
     *       updated_at: "2015-04-20T17:58:15.454Z"
     *     }
     *   ]
     * }
     * </pre>
     */
    this.all = function() {
      return tokens().getList();
    };

    /**
     * @ngdoc function
     * @name get
     * @methodOf predicsis.jsSDK.models.OauthTokens
     * @description Return a single token object. Be aware that this function's result doesn't contain the token.
     * @param {String} tokenId Token unique identifier
     * @return {Object}
     * <pre>
     * {
     *   access_tokens: {
     *     id: "5409cc5f69702d0007180000",
     *     created_at: "2014-09-05T14:44:47.172Z",
     *     updated_at: "2014-09-05T14:44:47.172Z"
     *   }
     * }
     * </pre>
     */
    this.get = function(tokenId) {
      return settings().one('tokens', tokenId).get();
    };

    /**
     * @ngdoc function
     * @name delete
     * @methodOf predicsis.jsSDK.models.OauthTokens
     * @description Revoke a personal token
     *
     * By sending this request, we remove this token from our database which means that all request sent with its will
     * get a 401 Unauthorized HTTP status.
     *
     * This request will result a 204 No-Content status code, except if the token can't be found (in this case, you will get a 404 Not-Found error).
     *
     * @param {String} tokenId Token unique identifier
     */
    this.delete = function(tokenId) {
      return settings().one('tokens', tokenId).remove();
    };

  });

/**
 * @ngdoc service
 * @name predicsis.jsSDK.models.PreparationRules
 * @requires $q
 * @requires Restangular
 * @requires Jobs
 * @description
 * <table>
 *   <tr>
 *     <td><span class="badge post">post</span> <kbd>/preparation_rules_sets</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.models.PreparationRules#methods_create PreparationRules.create()}</kbd></td>
 *     <td><span class="badge async">async</span></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge get">get</span> <kbd>/preparation_rules_sets</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.models.PreparationRules#methods_all PreparationRules.all()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge get">get</span> <kbd>/preparation_rules_sets/:id</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.models.PreparationRules#methods_get PreparationRules.get()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge patch">patch</span> <kbd>/preparation_rules_sets/:id</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.models.PreparationRules#methods_update PreparationRules.update()}</kbd></td>
 *     <td><span class="badge async">async</span></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge delete">delete</span> <kbd>/preparation_rules_sets/:id</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.models.PreparationRules#methods_delete PreparationRules.delete()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tfoot>
 *     <tr><td colspan="3">Official documentation is available at https://developer.predicsis.com/doc/v1/preparation_rules/</td></tr>
 *   </tfoot>
 * </table>
 *
 * Output example:
 * <pre>
 *   {
 *     id: "5475d317617070000a300100",
 *     created_at: "2014-11-26T13:18:15.550Z",
 *     updated_at: "2014-11-26T13:18:18.546Z",
 *     name: null,
 *     user_id: "541b06dc617070006d060000",
 *     dataset_id: null,
 *     variable_id: "5475d285776f7200019a0300",
 *     job_ids: [ "5475d317617070000a310100" ]
 *   }
 * </pre>
 */
angular
  .module('predicsis.jsSDK.models')
  .service('PreparationRules', function($q, Restangular, Jobs) {
    'use strict';

    function preparationRulesSet(id) { return Restangular.one('preparation_rules_sets', id); }
    function preparationRulesSets() { return Restangular.all('preparation_rules_sets'); }

    // -----------------------------------------------------------------------------------------------------------------

    /**
     * @ngdoc function
     * @name create
     * @methodOf predicsis.jsSDK.models.PreparationRules
     * @description Create a preparation rules set
     *
     *  You must give the following parameters to create a new preparation rules set:
     *  <pre>
     *  {
     *    dataset_id:  "53c7dea470632d3417020000",
     *    variable_id: "5329601c1757f446e6000002"
     *  }
     *  </pre>
     *
     * @param {Object} params See above example.
     * @return {Promise} New preparation rules set
     */
    this.create = function(params) {
      return Jobs.wrapAsyncPromise(preparationRulesSets().post({preparation_rules_set: params}))
        .then(function(result) {
          return preparationRulesSet(result.id).get();
        });
    };

    /**
     * @ngdoc function
     * @name all
     * @methodOf predicsis.jsSDK.models.PreparationRules
     * @description Get all (or a list of) preparation rules sets
     * @param {Array} [preparationRulesSetIds] List of preparation rules sets ids you want to fetch
     * @return {Promise} A list of preparation rules sets
     */
    this.all = function(preparationRulesSetIds) {
      if(preparationRulesSetIds === undefined) {
        return preparationRulesSets().getList();
      } else {
        preparationRulesSetIds = preparationRulesSetIds || [];

        return $q.all(preparationRulesSetIds.map(function(id) {
          return preparationRulesSet(id).get();
        }));
      }
    };

    /**
     * @ngdoc function
     * @name get
     * @methodOf predicsis.jsSDK.models.PreparationRules
     * @description Get a single preparation rules set by its id
     * @param {String} id Preparation rules set identifier
     * @return {Promise} A preparation rules set
     */
    this.get = function(id) {
      return preparationRulesSet(id).get();
    };

    /**
     * @ngdoc function
     * @name update
     * @methodOf predicsis.jsSDK.models.PreparationRules
     * @description Update specified preparation rules set
     *  You can update the following parameters:
     *  <ul>
     *    <li><code>{String} name</code></li>
     *  </ul>
     *
     * @param {String} id Id of the preparation rules set you want to update
     * @param {Object} changes see above description to know parameters you are able to update
     * @return {Promise} Updated preparation rules set
     */
    this.update = function(id, changes) {
      return Jobs.wrapAsyncPromise(preparationRulesSet(id).patch({preparation_rules_set: changes}))
        .then(function(result) {
          return preparationRulesSet(result.id).get();
        });
    };

    /**
     * @ngdoc function
     * @name delete
     * @methodOf predicsis.jsSDK.models.PreparationRules
     * @description Permanently destroy a specified preparation rules set
     * @param {String} id Id of the preparation rules set you want to remove
     * @return {Promise} A removed preparation rules set
     */
    this.delete = function(id) {
      return preparationRulesSet(id).remove();
    };

  });

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

/**
 * @ngdoc service
 * @name predicsis.jsSDK.models.Sources
 * @requires $q
 * @requires Restangular
 * @description Sources are a representation of an uploaded file on our storage. At time, all uploads are sent to Amazon S3.
 *
 * <table>
 *   <tr>
 *     <td><span class="badge post">post</span> <kbd>/sources</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.models.Sources#methods_create Sources.create()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge get">get</span> <kbd>/sources</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.models.Sources#methods_all Sources.all()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge get">get</span> <kbd>/sources/:id</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.models.Sources#methods_get Sources.get()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge patch">patch</span> <kbd>/sources/:id</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.models.Sources#methods_update Sources.update()}</kbd></td>
 *     <td><span class="badge async">async</span></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge delete">delete</span> <kbd>/sources/:id</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.models.Sources#methods_delete Sources.delete()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tfoot>
 *     <tr><td colspan="3">Official documentation is available at https://developer.predicsis.com/doc/v1/data_management/source/</td></tr>
 *   </tfoot>
 * </table>
 *
 * Output example:
 * <pre>
 * {
 *   id: "54edf76c6170700001860000",
 *   created_at: "2015-02-25T16:25:16.889Z",
 *   updated_at: "2015-02-25T16:25:16.889Z",
 *   name: "hello.csv",
 *   user_id: "541b06dc617070006d060000",
 *   dataset_ids: [],
 *   data_file: {
 *     id: "54edf76c6170700001870000",
 *     filename: "hello.csv",
 *     type: "S3",
 *     size: 24,
 *     url: "https://s3-us-west-2.amazonaws.com/stag.public.kml-api/uploads/541b06dc617070006d060000/sources/1424881474630/hello.csv?AWSAccessKeyId=AKIAIAVVU5KANH5LYROQ&Expires=1425411327&Signature=svmZQCMzgdqzFrbme%2Fy04RzszU0%3D&x-amz-acl=private"
 *   }
 * }
 * </pre>
 */
angular
  .module('predicsis.jsSDK.models')
  .service('Sources', function($q, Restangular) {
    'use strict';

    function source(id) { return Restangular.one('sources', id); }
    function sources() { return Restangular.all('sources'); }

    // -----------------------------------------------------------------------------------------------------------------

    /**
     * @ngdoc function
     * @name create
     * @methodOf predicsis.jsSDK.models.Sources
     * @description Send POST request to the <code>source</code> API resource.
     *
     *  This request is going to create and persist in database a source object regarding to a given uploaded file.
     *  So, you must upload a file first.
     *
     *  You can / must give the following parameters to ask for a source creation:
     *  <pre>
     *  {
     *    name: "Source of dataset.csv"
     *    key:  "path/to/my/file/on/s3/source.csv",
     *  }
     *  </pre>
     *
     *  Both <code>name</code> and <code>key</code> are required.
     *
     * @param {Object} params See above example.
     * @return {Promise} New source
     */
    this.create = function(params) {
      return sources().post({source: params});
    };

    /**
     * @ngdoc function
     * @name all
     * @methodOf predicsis.jsSDK.models.Sources
     * @description Get all (or a list of) generated sources
     * @param {Array} [sourceIds] List of sources' id you want to fetch
     * @return {Promise} A list of sources
     */
    this.all = function(sourceIds) {
      if(sourceIds === undefined) {
        return sources().getList();
      } else {
        sourceIds = sourceIds || [];

        return $q.all(sourceIds.map(function(id) {
          return source(id).get();
        }));
      }
    };

    /**
     * @ngdoc function
     * @name get
     * @methodOf predicsis.jsSDK.models.Sources
     * @description Get a single source by its id
     * @param {String} sourceId Source identifier
     * @return {Promise} A single source
     */
    this.get = function(sourceId) {
      return source(sourceId).get();
    };

    /**
     * @ngdoc function
     * @name update
     * @methodOf predicsis.jsSDK.models.Sources
     * @description Update specified source
     *
     *  You can update the following parameters:
     *  <ul>
     *    <li><code>{String} name</code></li>
     *  </ul>
     *
     * @param {String} sourceId Id of the source you want to update
     * @param {Object} changes see above description to know parameters you are able to update
     * @return {Promise} An updated source
     */
    this.update = function(sourceId, changes) {
      return source(sourceId).patch({source: changes});
    };

    /**
     * @ngdoc function
     * @name delete
     * @methodOf predicsis.jsSDK.models.Sources
     * @description Permanently destroy a specified source
     * @param {String} sourceId Id of the source you want to remove
     * @return {Promise} A removed source
     */
    this.delete = function(sourceId) {
      return source(sourceId).remove();
    };

  });

/**
 * @ngdoc service
 * @name predicsis.jsSDK.models.Uploads
 * @requires $q
 * @requires Restangular
 * @description
 * <table>
 *   <tr>
 *     <td><span class="badge get">get</span> <kbd>/sources/credentials/s3</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.models.Uploads#methods_getcredentials Upload.getCredentials()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge post">post</span> <kbd>/sources/credentials/s3</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.models.Uploads#methods_sign Upload.sign(key)}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tfoot>
 *   <tr><td colspan="3">Official documentation is available at https://developer.predicsis.com/doc/v1/data_management/upload/</td></tr>
 *   </tfoot>
 * </table>
 *
 * Uploads are performed in 3 steps (this model only deals with the first one):
 * <ul>
 *   <li>Get credentials to our storage service and upload a file</li>
 *   <li>Create a source to persist upload in our database</li>
 *   <li>Create a dataset from this source</li>
 * </ul>
 */
angular
  .module('predicsis.jsSDK.models')
  .service('Uploads', function(Restangular) {
    'use strict';

    function credentials(storageService) { return Restangular.all('sources').one('credentials', storageService); }

    // -----------------------------------------------------------------------------------------------------------------

    /**
     * @ngdoc function
     * @name getCredentials
     * @methodOf predicsis.jsSDK.models.Uploads
     * @description Request credentials to our storage service
     *  Credentials for S3 storage looks like:
     *  <pre>
     *  {
     *    credentials: {
     *      expires_at: "2014-06-23T08:07:19.000Z",
     *      key: "uploads/5347b31750432d45a5020000/sources/1415101671848/${filename}",
     *      aws_access_key_id: "predicsis_aws_access_key_id",
     *      signature: "encoded_signature",
     *      policy: "encoded_policy",
     *      s3_endpoint: "http://dev.public.kml-api.s3-us-west-2.amazonaws.com"
     *    }
     *  }
     *  </pre>
     *
     * @param {String} storageService Available services are : <ul><li><code>s3</code></li></ul>
     * @return {Object} See above description
     */
    this.getCredentials = function(storageService) {
      return credentials(storageService).get();
    };

    /**
     * @ngdoc function
     * @name sign
     * @methodOf predicsis.jsSDK.models.Uploads
     * @description Sign POST requests from fineuploader library
     *  This route is required to use {@link http://docs.fineuploader.com/branch/master/endpoint_handlers/amazon-s3.html#required-server-side-tasks-all-browsers fineuploader library}.
     *
     *  <b>Important note</b>
     *  This request returns a object like:
     *  <pre>
     *  {
     *    credentials: {
     *      expires_at: "2014-06-23T08:07:19.000Z",
     *      key: "uploads/5347b31750432d45a5020000/sources/1415101671848/${filename}",
     *      aws_access_key_id: "predicsis_aws_access_key_id",
     *      signature: "encoded_signature",
     *      policy: "encoded_policy",
     *      s3_endpoint: "http://dev.public.kml-api.s3-us-west-2.amazonaws.com"
     *    }
     *  }
     *  </pre>
     *
     *  ... but the library only needs (and expects) <kbd>policy</kbd> and <kbd>signature</kbd> properties. So I had to
     *  change the source code of fineuploader lib to remove the header of the response. That's the main reason to commit
     *  this source code in the project (under <kbd>app/vendor/s3.fineuploader-5.0.8/</kbd>).
     *
     * @param {String} key Path where the file is going to be uploaded
     * @return {Object} A credentials object which must contains at least <kbd>policy</kbd> and <kbd>signature</kbd> properties.
     */
    this.sign = function(key) {
      return credentials('s3', key).post({credentials: {key: key}});
    };

  });

/**
 * @ngdoc service
 * @name predicsis.jsSDK.models.UserSettings
 * @requires Restangular
 * @description
 * <table>
 *   <tr>
 *     <td><span class="badge get">get</span> <kbd>/settings</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.models.UserSettings#methods_get UserSettings.get()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge patch">patch</span> <kbd>/settings</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.models.UserSettings#methods_update UserSettings.update()}</kbd></td>
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
angular
  .module('predicsis.jsSDK.models')
  .service('UserSettings', function(Restangular) {
    'use strict';

    /**
     * @ngdoc function
     * @name get
     * @methodOf predicsis.jsSDK.models.UserSettings
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
     * @methodOf predicsis.jsSDK.models.UserSettings
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

/**
 * @ngdoc service
 * @name predicsis.jsSDK.models.Users
 * @requires $q
 * @requires Restangular
 * @description
 * <table>
 *   <tr>
 *     <td><span class="badge post">post</span> <kbd>/users</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.models.Users#methods_create Users.create()}</kbd></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge post">post</span> <kbd>/users/password</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.models.Users#methods_resetPassword Users.resetPassword()}</kbd></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge get">get</span> <kbd>/users/:id</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.models.Users#methods_getcurrentuser Users.getCurrentUser()}</kbd></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge patch">patch</span> <kbd>/users/:id</kbd><br/><span class="badge patch">patch</span> <kbd>/users/update_password</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.models.Users#methods_update Users.update()}</kbd></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge delete">delete</span> <kbd>/users/:id</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.models.Users#methods_delete Users.delete()}</kbd></td>
 *   </tr>
 *   <tfoot>
 *     <tr><td colspan="3">Official documentation is available at:
 *       <ul>
 *         <li>https://developer.predicsis.com/doc/v1/user/</li>
 *         <li>https://developer.predicsis.com/doc/v1/user/settings/</li>
 *       </td></tr>
 *   </tfoot>
 * </table>
 *
 * Output example
 * <pre>
 *   {
 *     id: "5347b31750432d45a5020000",
 *     created_at: "2014-07-18T06:40:20.845Z",
 *     updated_at: "2014-07-18T06:40:20.847Z",
 *     name: "John Doe",
 *     email: "john.doe@example.org"
 *   }
 * </pre>
 */
angular
  .module('predicsis.jsSDK.models')
  .service('Users', function($q, Restangular) {
    'use strict';

    function user(id) { return Restangular.one('users', id); }
    function users() { return Restangular.all('users'); }
    function settings() { return Restangular.all('settings'); }

    // -----------------------------------------------------------------------------------------------------------------

    /**
     * @ngdoc function
     * @name create
     * @methodOf predicsis.jsSDK.models.Users
     * @description Create a new user
     *
     *  You must give the following parameters to create a new preparation rules set:
     *  <pre>
     *  {
     *    name:  "Test Ouille",
     *    email: "john.doe@example.com",
     *    password: "my-password"
     *  }
     *  </pre>
     *
     * @param {Object} params See above example.
     * @return {Promise} New user
     */
    this.create = function(params) {
      return users().post({ user: params });
    };

    /**
     * @ngdoc function
     * @name resetPassword
     * @methodOf predicsis.jsSDK.models.Users
     * @description Reset user's password
     * @param {String} email Email of the account you want to reset the password
     * @param {String} redirectUri Url to be redirected after complete resetting password
     * @return {Promise} User with resetted password
     */
    this.resetPassword = function(email, redirectUri) {
      return users().all('password').post({user: {email: email, redirect_uri: redirectUri}});
    };

    /**
     * @ngdoc function
     * @name getCurrentUser
     * @methodOf predicsis.jsSDK.models.Users
     * @description Get authenticated user
     * @return {Promise} Current user
     */
    this.getCurrentUser = function() {
      return user('me').get();
    };

    /**
     * @ngdoc function
     * @name update
     * @methodOf predicsis.jsSDK.models.Users
     * @description Update specified user
     *  You can update the following parameters:
     *  <ul>
     *    <li><code>{String} name</code></li>
     *    <li><code>{String} email</code></li>
     *    <li><code>{String} current_password</code></li>
     *    <li><code>{String} password</code></li>
     *  </ul>
     *
     *  <br/>
     *  <b>Note:</b> If <kbd>changes</kbd> param contains both <kbd>current_password</kbd> and <kbd>password</kbd>,
     *  these two properties are sent to <kbd>PATCH /users/update_password</kbd>.
     *  Any other param is sent to <kbd>PATCH /users/:id</kbd>.
     *
     * @param {String} id Id of the user you want to update
     * @param {Object} changes see above description to know parameters you are able to update
     * @return {Promise} Updated user and/or password
     */
    this.update = function(id, changes) {
      if ('current_password' in changes && 'password' in changes) {
        var password = {
          current_password: changes.current_password,
          password: changes.password
        };

        delete changes.current_password;
        delete changes.password;

        if (Object.keys(changes).length > 0) {
          return $q.all({
            profile: user(id).patch({user: changes}),
            password: users().all('update_password').patch({user: password})
          });
        } else {
          return users().all('update_password').patch({user: password});
        }
      } else {
        return user(id).patch({user: changes});
      }
    };

    /**
     * @ngdoc function
     * @name delete
     * @methodOf predicsis.jsSDK.models.Users
     * @description Permanently destroy a specified preparation rules set
     * @param {String} id Id of the preparation rules set you want to remove
     * @return {Promise} A removed preparation rules set
     */
    this.delete = function(id) {
      return user(id).remove();
    };

  });

/**
 * @ngdoc service
 * @name predicsis.jsSDK.models.Variables
 * @requires $q
 * @requires Restangular
 * @description
 * <table>
 *   <tr>
 *     <td><span class="badge get">get</span> <kbd>/dictionary/:dictionaryId/variables</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.models.Variables#methods_all Variables.all()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge get">get</span> <kbd>/dictionary/:dictionaryId/variables/:variableId</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.models.Variables#methods_get Variables.get()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge patch">patch</span> <kbd>/dictionary/:dictionaryId/variables/:variableId</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.models.Variables#methods_update Variables.update()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tfoot>
 *   <tr><td colspan="3">Official documentation is available at https://developer.predicsis.com/doc/v1/dictionary/variable/</td></tr>
 *   </tfoot>
 * </table>
 *
 * Output example:
 * <pre>
 * {
 *   id: "5492e2a6776f720001000500",
 *   created_at: "2014-12-18T14:20:22.858Z",
 *   updated_at: "2014-12-18T14:20:22.858Z",
 *   name: "Sepal Length",
 *   type: "continuous",
 *   use: true,
 *   description: null,
 *   dictionary_id: "5492e2b1617070000b1d0000",
 *   modalities_set_ids: []
 * }
 * </pre>
 *
 * As a variable cannot live without being attached to a dictionary, all request need a <code>dictionaryId</code>.
 */
angular
  .module('predicsis.jsSDK.models')
  .service('Variables', function($q, Restangular) {
    'use strict';

    function variable(dictionaryId, variableId) { return Restangular.one('dictionaries', dictionaryId).one('variables', variableId); }
    function variables(dictionaryId) { return Restangular.one('dictionaries', dictionaryId).all('variables'); }

    // -----------------------------------------------------------------------------------------------------------------

    /**
     * @ngdoc function
     * @name all
     * @methodOf predicsis.jsSDK.models.Variables
     * @description Get all (or a list of) variables of a specified dictionary
     * @param {String} dictionaryId  Id of the container dictionary
     * @param {Array} [variablesIds] List of variables' id you want to fetch
     * @return {Object} Promise of a variables list
     */
    this.all = function(dictionaryId, variablesIds) {
      if(variablesIds === undefined) {
        return variables(dictionaryId, variablesIds).getList();
      } else {
        variablesIds = variablesIds || [];

        return $q.all(variablesIds.map(function(id) {
          return variable(dictionaryId, id).get();
        }));
      }
    };

    /**
     * @ngdoc function
     * @name get
     * @methodOf predicsis.jsSDK.models.Variables
     * @description Get a single variable by its id
     * @param {String} dictionaryId Id of the variable you want to fetch
     * @param {String} variableId   Id of the container dictionary
     * @return {Object} Promise of a dictionary
     */
    this.get = function(dictionaryId, variableId) {
      return variable(dictionaryId, variableId).get();
    };

    /**
     * @ngdoc function
     * @name update
     * @methodOf predicsis.jsSDK.models.Variables
     * @description Update specified variable
     *  You can update the following parameters:
     *  <ul>
     *    <li><code>{Boolean} use</code></li>
     *    <li><code>{String} description</code> (max. 256 characters)</li>
     *    <li><code>{String} type</code> only among the following list: `categorical`, `continuous`</li>
     *  </ul>
     *
     * @param {String} dictionaryId Id of the variable you want to fetch
     * @param {String} variableId   Id of the variable you want to update
     * @param {Object} changes      see above description to know parameters you are able to update
     * @return {Object} Promise of the updated variable
     */
    this.update = function(dictionaryId, variableId,  changes) {
      return variable(dictionaryId, variableId).patch({variable: changes});
    };

  });

/**
 * @ngdoc service
 * @name predicsis.jsSDK.helpers.s3FileHelper
 * @require $injector
 * - Uploads
 */
angular
  .module('predicsis.jsSDK.helpers')
  .service('s3FileHelper', function($injector) {
    'use strict';

    var Upload = $injector.get('Uploads');
    var files = [];
    var progressHandlers = [];
    var endHandlers = [];
    var errorHandlers = [];
    var requests = [];

    function findFileIndex(file) {
      var index = files.indexOf(file);
      if(index === -1) {
        files.push(file);
        index = files.length - 1;
      }
      return index;
    }

    function progressHandler(fileIndex, evt) {
      if(progressHandlers[fileIndex]) {
        progressHandlers[fileIndex](evt);
      }
    }

    function endHandler(fileIndex, evt) {
      if(endHandlers[fileIndex]) {
        endHandlers[fileIndex](evt);
      }
    }

    function errorHandler(fileIndex, err) {
      if(errorHandlers[fileIndex]) {
        errorHandlers[fileIndex](err);
      }
    }

    function clean(fileIndex) {
      delete progressHandlers[fileIndex];
      delete files[fileIndex];
      delete requests[fileIndex];
    }

    function abort(file) {
      var fileIndex = findFileIndex(file);
      if(requests[fileIndex]) {
        requests[fileIndex].abort();
      }
      clean(fileIndex);
    }

    function addProgressListener(file, cb) {
      var fileIndex = findFileIndex(file);
      progressHandlers[fileIndex] = cb;
    }

    function addEndListener(file, cb) {
      var fileIndex = findFileIndex(file);
      endHandlers[fileIndex] = cb;
    }

    function addErrorListener(file, cb) {
      var fileIndex = findFileIndex(file);
      errorHandlers[fileIndex] = cb;
    }

    /**
     * @ngdoc function
     * @methodOf predicsis.jsSDK.helpers.s3FileHelper
     * @name upload
     * @description upload a file to S3
     *
     * @param {Object} file html5 File instance
     * @return {Promise} Resolved promise my have 2 response whether if upload success or fail:
     * <ul>
     *   <li><b>Success</b> <code>{filename: file.name, key: key}</code></li>
     *   <li><b>Fail</b> <code>{status: xhr2.status, err: xhr2.responseText}</code></li>
     * </ul>
     */
    this.upload = function(file) {
      var fileIndex = findFileIndex(file);
      Upload.getCredentials('s3')
        .then(function(credential) {
          var key = credential.key.replace('${filename}', file.name);
          var xhr2 = new XMLHttpRequest();
          requests[fileIndex] = xhr2;
          var form = formFactory({
            key: key,
            AWSAccessKeyId: credential.aws_access_key_id,
            'Content-Type': 'multipart/form-data',
            success_action_status: 201,
            acl: 'private',
            policy: credential.policy,
            signature: credential.signature
          }, {
            file: file
          });

          xhr2.open('POST', credential.s3_endpoint, true);
          xhr2.upload.addEventListener('progress', progressHandler.bind(null, fileIndex));

          xhr2.addEventListener('load', function() {
            clean(fileIndex);
            if(xhr2.status === 201) {
              endHandler(fileIndex, {filename: file.name, key: key});
            } else {
              errorHandler(fileIndex, {status: xhr2.status, err: xhr2.responseText});
            }
          });
          xhr2.addEventListener('error', function(err) {
            clean(fileIndex);
            errorHandler(fileIndex, err);
          });
          xhr2.send(form);
        });
    };

    this.on = function(eventName, file, cb) {
      if((eventName !== 'progress' && eventName !== 'end' && eventName !== 'error') || !file) {
        throw 'Invalid event name or invalid file';
      }
      if(eventName === 'progress') {
        addProgressListener(file, cb);
      } else if (eventName === 'end') {
        addEndListener(file, cb);
      } else {
        addErrorListener(file, cb);
      }
    };

    this.list = function() {
      return files.filter(function(file) {
        return file !== undefined;
      });
    };

    this.abort = abort;
  });
