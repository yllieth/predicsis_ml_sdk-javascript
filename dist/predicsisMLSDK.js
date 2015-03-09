/**
 * @ngdoc service
 * @name API.model.Datasets
 * @requires $q
 * @requires apiRestangular
 * @requires jobCompletion
 * @description
 * <table>
 *   <tr>
 *     <td><span class="badge post">post</span> <kbd>/datasets</kbd></td>
 *     <td><kbd>{@link API.model.Datasets#methods_create Datasets.create()}</kbd></td>
 *     <td><span class="badge async">async</span></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge post">post</span> <kbd>/datasets</kbd></td>
 *     <td><kbd>{@link API.model.Datasets#methods_split Datasets.split()}</kbd></td>
 *     <td><span class="badge async">async</span></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge get">get</span> <kbd>/datasets</kbd></td>
 *     <td><kbd>{@link API.model.Datasets#methods_all Datasets.all()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge get">get</span> <kbd>/datasets/:id</kbd></td>
 *     <td><kbd>{@link API.model.Datasets#methods_get Datasets.get()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge get">get</span><span class="badge get">get</span><span class="badge get">get</span></td>
 *     <td><kbd>{@link API.model.Datasets#methods_getchildren Datasets.getChildren()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge patch">patch</span> <kbd>/datasets/:id</kbd></td>
 *     <td><kbd>{@link API.model.Datasets#methods_update Datasets.update()}</kbd></td>
 *     <td><span class="badge async">async</span></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge delete">delete</span> <kbd>/datasets/:id</kbd></td>
 *     <td><kbd>{@link API.model.Datasets#methods_delete Datasets.delete()}</kbd></td>
 *     <td></td>
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
 * {
 *   id: 'learning_dataset',
 *   created_at: '2014-12-14T15:09:08.112Z',
 *   updated_at: '2014-12-14T15:08:57.970Z',
 *   name: 'Learning dataset',
 *   header: null,
 *   separator: null,
 *   user_id: '541b06dc617070006d060000',
 *   source_ids: ['54904b136170700007330000'],
 *   parent_dataset_id: null,
 *   sampling: 100,
 *   nb_of_lines: 50002,
 *   children_dataset_ids: [],
 *   dictionaries_ids: [],
 *   generated_dictionaries_ids: [],
 *   data_file: {
 *     id: '54904b09776f720001650000',
 *     filename: 'learning-dataset.csv',
 *     type: 'S3',
 *     size: 538296,
 *     url: S3_URL + '/download/file/from/s3/learning-dataset.csv'
 *   },
 *   main_modality: null,
 *   classifier_id: null,
 *   dataset_id: null,
 *   job_ids: ['54904b146170700007360000'],
 *   preview: [
 *     '...\t...\t...',
 *     '...\t...\t...',
 *     '...\t...\t...',
 *     '...\t...\t...',
 *     '...\t...\t...'
 *   ]
 * }
 * </pre>
 *
 * <h3>Splitted learning dataset -> learned part</h3>
 * <pre>
 * {
 *   ...
 *   source_ids: [],
 *   parent_dataset_id: 'learning_dataset_with_model',
 *   sampling: 70,
 *   nb_of_lines: null,
 *   preview: null
 *   ...
 * }
 * </pre>
 *
 * <h3>Splitted learning dataset -> tested part</h3>
 * <pre>
 * {
 *   ...
 *   source_ids: [],
 *   parent_dataset_id: 'learning_dataset_with_model',
 *   sampling: -70,
 *   nb_of_lines: null,
 *   preview: null
 *   ...
 * }
 * </pre>
 *
 * <h3>After model generation</h3>
 * <pre>
 * {
 *   ...
 *   generated_dictionaries_ids: ['parent_dictionary'],
 *   children_dataset_ids: ['learned_learning_dataset', 'tested_learning_dataset'],
 *   job_ids: [
 *     '54904bfe6170700007930000',
 *     '54904bf961707000078c0000',
 *     '54904b146170700007360000',
 *     '54904ce06170700007d10000'
 *   ]
 *   ...
 * }
 * </pre>
 *
 * <h3>Scoring dataset</h3>
 * <pre>
 * {
 *   ...
 *   source_ids: ['54904da06170700007df0000'],
 *   generated_dictionaries_ids: [],
 *   children_dataset_ids: [],
 *   ...
 * }
 * </pre>
 *
 * <h3>Scoreset</h3>
 * <pre>
 * {
 *   ...
 *   classifier_id: '5436431070632d15f4260000',
 *   dataset_id: 'scoring_dataset',
 *   modalities_set_id: '53fdfa7070632d0fc5030000',
 *   ...
 * }
 * </pre>
 */
angular.module('API.model')
  .service('Datasets', function($q, apiRestangular, jobCompletion) {

    var self = this;

    function dataset(id) { return apiRestangular.one('datasets', id); }
    function datasets() { return apiRestangular.all('datasets'); }

    // -----------------------------------------------------------------------------------------------------------------

    /**
     * @ngdoc function
     * @name create
     * @methodOf API.model.Datasets
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
      return jobCompletion.wrapAsyncPromise(datasets().post({dataset: params}));
    };

    /**
     * @ngdoc function
     * @name split
     * @methodOf API.model.Datasets
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
     * @methodOf API.model.Datasets
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
     * @methodOf API.model.Datasets
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
     * @methodOf API.model.Datasets
     * @description Get learning/testing subsets of an original dataset
     * <div><span class="badge get">get</span><code>/datasets</code></div>
     * <div><span class="badge get">get</span><code>/dataset/:learned_dataset_id</code></div>
     * <div><span class="badge get">get</span><code>/dataset/:tested_dataset_id</code></div>
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
     * @methodOf API.model.Datasets
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

      return jobCompletion.wrapAsyncPromise(dataset(id).patch({dataset: changes}));
    };

    /**
     * @ngdoc function
     * @name delete
     * @methodOf API.model.Datasets
     * @description Permanently destroy a specified dataset
     * @param {String} id Id of the dataset you want to remove
     * @return {Promise} Removed dataset
     */
    this.delete = function(id) {
      return dataset(id).remove();
    };

  });

/**
 * @ngdoc service
 * @name API.model.Dictionaries
 * @requires $q
 * @requires apiRestangular
 * @requires jobCompletion
 * @description
 * <table>
 *   <tr>
 *     <td><span class="badge post">post</span> <kbd>/dictionaries</kbd></td>
 *     <td><kbd>{@link API.model.Dictionaries#methods_create Dictionaries.create()}</kbd></td>
 *     <td><span class="badge async">async</span></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge post">post</span> <kbd>/dictionaries</kbd></td>
 *     <td><kbd>{@link API.model.Dictionaries#methods_createFromDataset Dictionaries.createFromDataset()}</kbd></td>
 *     <td><span class="badge async">async</span></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge get">get</span> <kbd>/dictionaries</kbd></td>
 *     <td><kbd>{@link API.model.Dictionaries#methods_all Dictionaries.all()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge get">get</span> <kbd>/dictionaries/:id</kbd></td>
 *     <td><kbd>{@link API.model.Dictionaries#methods_get Dictionaries.get()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge patch">patch</span> <kbd>/dictionaries/:id</kbd></td>
 *     <td><kbd>{@link API.model.Dictionaries#methods_update Dictionaries.update()}</kbd></td>
 *     <td><span class="badge async">async</span></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge delete">delete</span> <kbd>/dictionaries/:id</kbd></td>
 *     <td><kbd>{@link API.model.Dictionaries#methods_delete Dictionaries.delete()}</kbd></td>
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
angular.module('API.model')
  .service('Dictionaries', function($q, apiRestangular, jobCompletion) {

    function dictionary(id) { return apiRestangular.one('dictionaries', id); }
    function dictionaries() { return apiRestangular.all('dictionaries'); }

    // -----------------------------------------------------------------------------------------------------------------

    /**
     * @ngdoc function
     * @name createFromDataset
     * @methodOf API.model.Dictionaries
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
     * @methodOf API.model.Dictionaries
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
      return jobCompletion.wrapAsyncPromise(dictionaries().post({dictionary: params}));
    };

    /**
     * @ngdoc function
     * @name all
     * @methodOf API.model.Dictionaries
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
     * @methodOf API.model.Dictionaries
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
     * @methodOf API.model.Dictionaries
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
      return jobCompletion.wrapAsyncPromise(dictionary(dictionaryId).patch({dictionary: changes}));
    };

    /**
     * @ngdoc function
     * @name delete
     * @methodOf API.model.Dictionaries
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
 * @name API.model.Jobs
 * @requires $q
 * @requires apiRestangular
 * @description
 * <table>
 *   <tr>
 *     <td><span class="badge get">get</span> <kbd>/jobs</kbd></td>
 *     <td><kbd>{@link API.model.Jobs#methods_all Jobs.all()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge get">get</span> <kbd>/jobs/:id</kbd></td>
 *     <td><kbd>{@link API.model.Jobs#methods_get Jobs.get()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge delete">delete</span> <kbd>/jobs/:id</kbd></td>
 *     <td><kbd>{@link API.model.Jobs#methods_delete Jobs.delete()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tfoot>
 *   <tr><td colspan="3">Official documentation is available at https://developer.predicsis.com/doc/v1/job</td></tr>
 *   </tfoot>
 * </table>
 *
 * Output example:
 * <pre>
 * {
 *   id: "53c7ded570632d3417050000",
 *   action: "Generate dictionary",
 *   status: "completed",
 *   error: null,
 *   warnings: null,
 *   created_at: "2014-05-02T15:42:51.687Z",
 *   started_at: "2014-05-02T15:42:52.687Z",
 *   finished_at: "2014-05-02T15:52:51.687Z",
 *   user_id: "5363b25c687964476d000000",
 *   runnable_id: "5363b7fc6879644ae7010000"
 * }
 * </pre>
 */
angular.module('API.model')
  .service('Jobs', function($q, apiRestangular) {

    function job(id) { return apiRestangular.one('jobs', id); }
    function jobs() { return apiRestangular.all('jobs'); }

    // -----------------------------------------------------------------------------------------------------------------

    /**
     * @ngdoc function
     * @name all
     * @methodOf API.model.Jobs
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
     * @methodOf API.model.Jobs
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
     * @methodOf API.model.Jobs
     * @description Permanently destroy a specified job
     * @param {String} jobId Id of the job you want to remove
     * @return {Object} Promise of an empty job
     */
    this.delete = function(jobId) {
      return job(jobId).remove();
    };

  });

/**
 * @ngdoc service
 * @name API.model.Modalities
 * @requires $q
 * @requires apiRestangular
 * @requires jobCompletion
 * @description
 * <table>
 *   <tr>
 *     <td><span class="badge post">post</span> <kbd>/modalities_sets</kbd></td>
 *     <td><kbd>{@link API.model.Modalities#methods_create Modalities.create()}</kbd></td>
 *     <td><span class="badge async">async</span></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge get">get</span> <kbd>/modalities_sets</kbd></td>
 *     <td><kbd>{@link API.model.Modalities#methods_all Modalities.all()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge get">get</span> <kbd>/modalities_sets/:id</kbd></td>
 *     <td><kbd>{@link API.model.Modalities#methods_get Modalities.get()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge delete">delete</span> <kbd>/modalities_sets/:id</kbd></td>
 *     <td><kbd>{@link API.model.Modalities#methods_delete Modalities.delete()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tfoot>
 *     <tr><td colspan="3">Official documentation is available at https://developer.predicsis.com/doc/v1/dictionary/modalities/</td></tr>
 *   </tfoot>
 * </table>
 */
angular.module('API.model')
  .service('Modalities', function($q, apiRestangular, jobCompletion) {

    function modality(id) { return apiRestangular.one('modalities_sets', id); }
    function modalities() { return apiRestangular.all('modalities_sets'); }

    // -----------------------------------------------------------------------------------------------------------------

    /**
     * @ngdoc function
     * @name create
     * @methodOf API.model.Modalities
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
     * @return {Promise} New modalities set
     */
    this.create = function(params) {
      return jobCompletion.wrapAsyncPromise(modalities().post({source: params}));
    };

    /**
     * @ngdoc function
     * @name all
     * @methodOf API.model.Modalities
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
     * @methodOf API.model.Modalities
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
     * @methodOf API.model.Modalities
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
 * @name API.model.Models
 * @requires $q
 * @requires apiRestangular
 * @requires jobCompletion
 * @description
 * <table>
 *   <tr>
 *     <td><span class="badge post">post</span> <kbd>/models</kbd></td>
 *     <td><kbd>{@link API.model.Models#methods_create Models.create()}</kbd></td>
 *     <td><span class="badge async">async</span></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge post">post</span> <kbd>/models</kbd></td>
 *     <td><kbd>{@link API.model.Models#methods_create Models.createClassifier()}</kbd></td>
 *     <td><span class="badge async">async</span></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge get">get</span> <kbd>/models</kbd></td>
 *     <td><kbd>{@link API.model.Models#methods_all Models.all()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge get">get</span> <kbd>/models/:id</kbd></td>
 *     <td><kbd>{@link API.model.Models#methods_get Models.get()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge patch">patch</span> <kbd>/models/:id</kbd></td>
 *     <td><kbd>{@link API.model.Models#methods_update Models.update()}</kbd></td>
 *     <td><span class="badge async">async</span></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge delete">delete</span> <kbd>/models/:id</kbd></td>
 *     <td><kbd>{@link API.model.Models#methods_delete Models.delete()}</kbd></td>
 *     <td></td>
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
angular.module('API.model')
  .service('Models', function($q, apiRestangular, jobCompletion) {

    var self = this;
    function model(id) { return apiRestangular.one('models', id); }
    function models() { return apiRestangular.all('models'); }

    // -----------------------------------------------------------------------------------------------------------------

    /**
     * @ngdoc function
     * @name createClassifier
     * @methodOf API.model.Models
     * @description Create a new classifier.
     * Simple shortcut for <code>{@link API.model.Models#method_create Models.create()} function.
     *
     * @param {String} preparationRulesSetId See {@link API.model.PreparationRules preparation rules} documentation
     * @return {Promise} A new classifier
     */
    this.createClassifier = function(preparationRulesSetId) {
      return self.create({type: 'classifier', preparation_rules_set_id: preparationRulesSetId});
    }

    // -----------------------------------------------------------------------------------------------------------------

    /**
     * @ngdoc function
     * @name create
     * @methodOf API.model.Models
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
      return jobCompletion.wrapAsyncPromise(models().post({model: params}));
    };

    /**
     * @ngdoc function
     * @name all
     * @methodOf API.model.Models
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
     * @methodOf API.model.Models
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
     * @methodOf API.model.Models
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
      return jobCompletion.wrapAsyncPromise(model(id).patch({model: changes}));
    };

    /**
     * @ngdoc function
     * @name delete
     * @methodOf API.model.Models
     * @description Permanently destroy a specified model
     * @param {String} id Id of the model you want to remove
     * @return {Promise} A removed model
     */
    this.delete = function(id) {
      return model(id).remove();
    };

  });

/**
 * @ngdoc service
 * @name API.model.PreparationRules
 * @requires $q
 * @requires apiRestangular
 * @requires jobCompletion
 * @description
 * <table>
 *   <tr>
 *     <td><span class="badge post">post</span> <kbd>/preparation_rules_sets</kbd></td>
 *     <td><kbd>{@link API.model.PreparationRules#methods_create PreparationRules.create()}</kbd></td>
 *     <td><span class="badge async">async</span></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge get">get</span> <kbd>/preparation_rules_sets</kbd></td>
 *     <td><kbd>{@link API.model.PreparationRules#methods_all PreparationRules.all()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge get">get</span> <kbd>/preparation_rules_sets/:id</kbd></td>
 *     <td><kbd>{@link API.model.PreparationRules#methods_get PreparationRules.get()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge patch">patch</span> <kbd>/preparation_rules_sets/:id</kbd></td>
 *     <td><kbd>{@link API.model.PreparationRules#methods_update PreparationRules.update()}</kbd></td>
 *     <td><span class="badge async">async</span></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge delete">delete</span> <kbd>/preparation_rules_sets/:id</kbd></td>
 *     <td><kbd>{@link API.model.PreparationRules#methods_delete PreparationRules.delete()}</kbd></td>
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
 *     id": "5475d317617070000a300100",
 *     created_at": "2014-11-26T13:18:15.550Z",
 *     updated_at": "2014-11-26T13:18:18.546Z",
 *     name": null,
 *     user_id": "541b06dc617070006d060000",
 *     dataset_id": null,
 *     variable_id": "5475d285776f7200019a0300",
 *     job_ids": [ "5475d317617070000a310100" ]
 *   }
 * </pre>
 */
angular.module('API.model')
  .service('PreparationRules', function($q, apiRestangular, jobCompletion) {

    function preparationRulesSet(id) { return apiRestangular.one('preparation_rules_sets', id); }
    function preparationRulesSets() { return apiRestangular.all('preparation_rules_sets'); }

    // -----------------------------------------------------------------------------------------------------------------

    /**
     * @ngdoc function
     * @name create
     * @methodOf API.model.PreparationRules
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
      return jobCompletion.wrapAsyncPromise(preparationRulesSets().post({preparation_rules_set: params}));
    };

    /**
     * @ngdoc function
     * @name all
     * @methodOf API.model.PreparationRules
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
     * @methodOf API.model.PreparationRules
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
     * @methodOf API.model.PreparationRules
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
      return jobCompletion.wrapAsyncPromise(preparationRulesSet(id).patch({preparation_rules_set: changes}));
    };

    /**
     * @ngdoc function
     * @name delete
     * @methodOf API.model.PreparationRules
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
 * @name API.model.Projects
 * @requires $q
 * @requires apiRestangular
 * @description
 * <table>
 *   <tr>
 *     <td><span class="badge post">post</span> <kbd>/projects</kbd></td>
 *     <td><kbd>{@link API.model.Projects#methods_create Projects.create()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge get">get</span> <kbd>/projects</kbd></td>
 *     <td><kbd>{@link API.model.Projects#methods_all Projects.all()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge get">get</span> <kbd>/projects/:id</kbd></td>
 *     <td><kbd>{@link API.model.Projects#methods_get Projects.get()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge patch">patch</span> <kbd>/projects/:id</kbd></td>
 *     <td><kbd>{@link API.model.Projects#methods_update Projects.update()}</kbd></td>
 *     <td><span class="badge async">async</span></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge delete">delete</span> <kbd>/projects/:id</kbd></td>
 *     <td><kbd>{@link API.model.Projects#methods_delete Projects.delete()}</kbd></td>
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
 * See {@link API.helper.projectsHelper projects helper} to get the following methods:
 * <ul>
 *   <li><code>{@link API.helper.projectsHelper#methods_isModelDone isModelDone(Projects project)}</code></li>
 *   <li><code>{@link API.helper.projectsHelper#methods_isDictionaryVerified isDictionaryVerified(Projects project)}</code></li>
 *   <li><code>{@link API.helper.projectsHelper#methods_getCurrentState getCurrentState(Projects project)}</code></li>
 *   <li><code>{@link API.helper.projectsHelper#methods_getCurrentStep getCurrentStep(String currentView)}</code></li>
 *   <li><code>{@link API.helper.projectsHelper#methods_getStateFromStep getStateFromStep(Projects project, String toStep)}</code></li>
 *   <li><code>{@link API.helper.projectsHelper#methods_addLearningDataset addLearningDataset(Projects project, String datasetId)}</code></li>
 *   <li><code>{@link API.helper.projectsHelper#methods_addScoringDataset addScoringDataset(Projects project, String datasetId)}</code></li>
 *   <li><code>{@link API.helper.projectsHelper#methods_addScoreset addScoreset(Projects project, String datasetId)}</code></li>
 *   <li><code>{@link API.helper.projectsHelper#methods_resetDictionary resetDictionary(String projectId)}</code></li>
 *   <li><code>{@link API.helper.projectsHelper#methods_removeDependencies removeDependencies(String projectId)}</code></li>
 * </ul>
 */
angular.module('API.model')
  .service('Projects', function($q, apiRestangular) {

    function project(id) { return apiRestangular.one('projects', id); }
    function projects() { return apiRestangular.all('projects'); }

    // -----------------------------------------------------------------------------------------------------------------

    /**
     * @ngdoc function
     * @name create
     * @methodOf API.model.Projects
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
     * @methodOf API.model.Projects
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
     * @methodOf API.model.Projects
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
     * @methodOf API.model.Projects
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
     * @methodOf API.model.Projects
     * @description Permanently destroy a specified project
     *  <b>Important:</b> {@link API.helper.projectsHelper#methods_removeDependencies Remove project's dependencies}
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

/**
 * @ngdoc service
 * @name API.model.Reports
 * @requires $q
 * @requires apiRestangular
 * @requires jobCompletion
 * @requires $injector
 * - Datasets
 * @description
 * <table>
 *   <tr>
 *     <td><span class="badge post">post</span> <kbd>/reports</kbd></td>
 *     <td><kbd>{@link API.model.Reports#methods_createTrainClassifierEvaluationReport Reports.createTrainClassifierEvaluationReport()}</kbd></td>
 *     <td><span class="badge async">async</span></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge post">post</span> <kbd>/reports</kbd></td>
 *     <td><kbd>{@link API.model.Reports#methods_createTestClassifierEvaluationReport Reports.createTestClassifierEvaluationReport()}</kbd></td>
 *     <td><span class="badge async">async</span></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge post">post</span> <kbd>/reports</kbd></td>
 *     <td><kbd>{@link API.model.Reports#methods_createUnivariateSupervisedReport Reports.createUnivariateSupervisedReport()}</kbd></td>
 *     <td><span class="badge async">async</span></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge post">post</span> <kbd>/reports</kbd></td>
 *     <td><kbd>{@link API.model.Reports#methods_create Reports.create()}</kbd></td>
 *     <td><span class="badge async">async</span></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge get">get</span> <kbd>/reports</kbd></td>
 *     <td><kbd>{@link API.model.Reports#methods_all Reports.all()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge get">get</span> <kbd>/reports/:id</kbd></td>
 *     <td><kbd>{@link API.model.Reports#methods_get Reports.get()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge patch">patch</span> <kbd>/reports/:id</kbd></td>
 *     <td><kbd>{@link API.model.Reports#methods_update Reports.update()}</kbd></td>
 *     <td><span class="badge async">async</span></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge delete">delete</span> <kbd>/reports/:id</kbd></td>
 *     <td><kbd>{@link API.model.Reports#methods_delete Reports.delete()}</kbd></td>
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
angular.module('API.model')
  .service('Reports', function($q, $injector, apiRestangular, jobCompletion) {

    var that = this;
    var report = function(id) { return apiRestangular.one('reports', id); };
    var reports = function() { return apiRestangular.all('reports'); };
    function createClassifierEvaluationReport(project, type) {
      var Datasets = $injector.get('Datasets');
      return Datasets.getChildren(project.learning_dataset_id)
        .then(function(children) {
          return that.create({
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
     * @methodOf API.model.Reports
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
     * @methodOf API.model.Reports
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
     * @methodOf API.model.Reports
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
      return that.create({
        type: 'univariate_supervised',
        dataset_id: project.learning_dataset_id,
        dictionary_id: project.dictionary_id,
        variable_id: project.target_variable_id
      });
    };

    /**
     * @ngdoc function
     * @name create
     * @methodOf API.model.Reports
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
      return jobCompletion.wrapAsyncPromise(reports().post({report: params}));
    };

    /**
     * @ngdoc function
     * @name all
     * @methodOf API.model.Reports
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
     * @methodOf API.model.Reports
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
     * @methodOf API.model.Reports
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
      return jobCompletion.wrapAsyncPromise(report(reportId).patch({report: changes}));
    };

    /**
     * @ngdoc function
     * @name delete
     * @methodOf API.model.Reports
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
 * @name API.model.Sources
 * @requires $q
 * @requires apiRestangular
 * @requires jobCompletion
 * @description Sources are a representation of an uploaded file on our storage. At time, all uploads are sent to Amazon S3.
 *
 * <table>
 *   <tr>
 *     <td><span class="badge post">post</span> <kbd>/sources</kbd></td>
 *     <td><kbd>{@link API.model.Sources#methods_create Sources.create()}</kbd></td>
 *     <td><span class="badge async">async</span></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge get">get</span> <kbd>/sources</kbd></td>
 *     <td><kbd>{@link API.model.Sources#methods_all Sources.all()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge get">get</span> <kbd>/sources/:id</kbd></td>
 *     <td><kbd>{@link API.model.Sources#methods_get Sources.get()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge patch">patch</span> <kbd>/sources/:id</kbd></td>
 *     <td><kbd>{@link API.model.Sources#methods_update Sources.update()}</kbd></td>
 *     <td><span class="badge async">async</span></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge delete">delete</span> <kbd>/sources/:id</kbd></td>
 *     <td><kbd>{@link API.model.Sources#methods_delete Sources.delete()}</kbd></td>
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
angular.module('API.model')
  .service('Sources', function($q, apiRestangular, jobCompletion) {

    function source(id) { return apiRestangular.one('sources', id); }
    function sources() { return apiRestangular.all('sources'); }

    // -----------------------------------------------------------------------------------------------------------------

    /**
     * @ngdoc function
     * @name create
     * @methodOf API.model.Sources
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
      return jobCompletion.wrapAsyncPromise(sources().post({source: params}));
    };

    /**
     * @ngdoc function
     * @name all
     * @methodOf API.model.Sources
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
     * @methodOf API.model.Sources
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
     * @methodOf API.model.Sources
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
      return jobCompletion.wrapAsyncPromise(source(sourceId).patch({source: changes}));
    };

    /**
     * @ngdoc function
     * @name delete
     * @methodOf API.model.Sources
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
 * @name API.model.Uploads
 * @requires $q
 * @requires apiRestangular
 * @requires jobCompletion
 * @description
 * <table>
 *   <tr>
 *     <td><span class="badge get">get</span> <kbd>/sources/credentials/s3</kbd></td>
 *     <td><kbd>{@link API.model.Uploads#methods_getcredentials Upload.getCredentials()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge post">post</span> <kbd>/sources/credentials/s3</kbd></td>
 *     <td><kbd>{@link API.model.Uploads#methods_sign Upload.sign(key)}</kbd></td>
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
angular.module('API.model')
  .service('Uploads', function(apiRestangular) {

    function credentials(storageService) { return apiRestangular.all('sources').one('credentials', storageService); }

    // -----------------------------------------------------------------------------------------------------------------

    /**
     * @ngdoc function
     * @name getCredentials
     * @methodOf API.model.Uploads
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
     * @methodOf API.model.Uploads
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
 * @name API.model.Users
 * @requires $q
 * @requires apiRestangular
 * @description
 * <table>
 *   <tr>
 *     <td><span class="badge post">post</span> <kbd>/users</kbd></td>
 *     <td><kbd>{@link API.model.Users#methods_create Users.create()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge post">post</span> <kbd>/users/password</kbd></td>
 *     <td><kbd>{@link API.model.Users#methods_resetPassword Users.resetPassword()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge get">get</span> <kbd>/users/:id</kbd></td>
 *     <td><kbd>{@link API.model.Users#methods_getcurrentuser Users.getCurrentUser()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge get">get</span> <kbd>/settings</kbd></td>
 *     <td><kbd>{@link API.model.Users#methods_getsettings Users.getSettings()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge patch">patch</span> <kbd>/settings</kbd></td>
 *     <td><kbd>{@link API.model.Users#methods_savesettings Users.saveSettings()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge patch">patch</span> <kbd>/users/:id</kbd><br/><span class="badge patch">patch</span> <kbd>/users/update_password</kbd></td>
 *     <td><kbd>{@link API.model.Users#methods_update Users.update()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge delete">delete</span> <kbd>/users/:id</kbd></td>
 *     <td><kbd>{@link API.model.Users#methods_delete Users.delete()}</kbd></td>
 *     <td></td>
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
angular.module('API.model')
  .service('Users', function($q, apiRestangular) {

    function user(id) { return apiRestangular.one('users', id); }
    function users() { return apiRestangular.all('users'); }
    function settings() { return apiRestangular.all('settings'); }

    // -----------------------------------------------------------------------------------------------------------------

    /**
     * @ngdoc function
     * @name create
     * @methodOf API.model.Users
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
     * @methodOf API.model.Users
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
     * @methodOf API.model.Users
     * @description Get authenticated user
     * @return {Promise} Current user
     */
    this.getCurrentUser = function() {
      return user('me').get();
    };

    /**
     * @ngdoc function
     * @name getSettings
     * @methodOf API.model.Users
     * @description Get active user's settings
     * @return {Promise} User's settings
     * <pre>
     *   {
     *      timezone: 'Europe/Paris',
     *      locale: 'fr-FR'
     *   }
     * </pre>
     */
    this.getSettings = function() {
      return settings().getList();
    };

    /**
     * @ngdoc function
     * @name saveSettings
     * @methodOf API.model.Users
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
    this.saveSettings = function(settings) {
      return settings().patch({settings: changes});
    };

    /**
     * @ngdoc function
     * @name update
     * @methodOf API.model.Users
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
     * @methodOf API.model.Users
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
 * @name API.model.Variables
 * @requires $q
 * @requires apiRestangular
 * @description
 * <table>
 *   <tr>
 *     <td><span class="badge get">get</span> <kbd>/dictionary/:dictionaryId/variables</kbd></td>
 *     <td><kbd>{@link API.model.Variables#methods_all Variables.all()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge get">get</span> <kbd>/dictionary/:dictionaryId/variables/:variableId</kbd></td>
 *     <td><kbd>{@link API.model.Variables#methods_get Variables.get()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge patch">patch</span> <kbd>/dictionary/:dictionaryId/variables/:variableId</kbd></td>
 *     <td><kbd>{@link API.model.Variables#methods_update Variables.update()}</kbd></td>
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
angular.module('API.model')
  .service('Variables', function($q, apiRestangular) {

    function variable(dictionaryId, variableId) { return apiRestangular.one('dictionaries', dictionaryId).one('variables', variableId); }
    function variables(dictionaryId) { return apiRestangular.one('dictionaries', dictionaryId).all('variables'); }

    // -----------------------------------------------------------------------------------------------------------------

    /**
     * @ngdoc function
     * @name all
     * @methodOf API.model.Variables
     * @description Get all (or a list of) generated dictionaries
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
          return variables(dictionaryId, id).get();
        }));
      }
    };

    /**
     * @ngdoc function
     * @name get
     * @methodOf API.model.Variables
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
     * @methodOf API.model.Variables
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

angular.module('API.model', []);
