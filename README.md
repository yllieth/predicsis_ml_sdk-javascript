# PredicSis ML SDK for Javascript.

The official PredicSis ML SDK for Javascript (for pure frontend applications, without node).

## Installation

Add PredicSis ML SDK into your `bower.json`

```shell
bower install predicsis_ml_sdk-javascript --save-dev
```

## Configuration

If you want to change PredicSis API host, add these lines to your `app.js` configuration file.

```ruby
angular.module('YourAngularApplication', ['predicsis.jsSDK'])
  .config(function(predicsisAPIProvider, config) {
    predicsisAPIProvider.setBaseUrl('https://predicsis_api_host');
  })
  
  // optional definition, just if you want to make your code more explicit, you also can add a factory to rename this service:
  .factory('api', function(predicsisAPI) {
    return predicsisAPI;
  })
```

By default, api endpoint is: `https://api.predicsis.com`

## Getting Started

You can start using our SDK assuming you already have a [user token](https://developer.predicsis.com/doc/v1/overview/oauth2/#get-authorization-from-a-user)

> Start a learn
>   The following code is going to send the requests listed below:
>   - `GET /datasets`
>   - `GET /datasets/:trainDatasetId`
>   - `GET /datasets/:testDatasetId`
>   - `POST /preparation_rules_sets`
>   - `POST /models`
>   - `POST /reports`
>   - `POST /reports`
>   - `POST /reports`
>   - `PATCH /projects/:projectId`


```javascript
var preparationRulesSet, classifier

return api.Datasets.getChildren(project.learning_dataset_id).then(function(children) {
  // create the preparation rules set
    return api.PreparationRules.create({
      variable_id: project.target_variable_id,
      dataset_id: children.train.id
    });
  })
  
  // create the model from preparation rules set
  .then(function(preparationRulesRet) {
    preparationRulesSet = preparationRulesRet
    return api.Models.createClassifier(preparationRulesRet.id);
  })
  
  // generate reports
  .then(function(classifier) {
    classifier = classifier
    return $q.all([
      api.Reports.createTrainClassifierEvaluationReport(project),
      api.Reports.createTestClassifierEvaluationReport(project),
      api.Reports.createUnivariateSupervisedReport(project)
    ]);
  })
  
  //update project
  .then(function(reports) {
    return api.Projects.update(project.id, {
      preparation_rules_set_id: preparation_rules_set.id,
      classifier_id: classifier.id,
      report_ids: reportIds
    });
  })
  
  //return classifier
  .then(function() {
    return classifier;
  });
```

... or just use `api.modelHelper.learn(project)` !

See the [SDK documentation](http://yllieth.github.io/predicsis_ml_sdk-javascript) for more examples.

## Available services
API resources     | Helpers
------------------|---------
Dataset           | 
Dictionary        | 
Jobs              | 
Modality          | 
Model             | Model helper
Oauth token       | 
Oauth application | 
Preparation rules | 
Project           | Project helper
Report            | 
Source            | 
Upload            | 
User              | 
User settings     | 
Variable          | 

## Run this project locally

This project comes with a little angular application (located in the `app` folder). After a complete install, just run:

```
  bower install
  npm install

  # start the server
  grunt connect:server
```

And go to `http://localhost:8100/app/index.html`.

## Getting Help

* [API documentation](https://developer.predicsis.com/doc/v1/overview/)
* [SDK documentation](http://yllieth.github.io/predicsis_ml_sdk-javascript)


## License

MIT. See the [LICENSE](https://github.com/yllieth/predicsis_ml_sdk-javascript/blob/master/LICENSE) for more details.


## Contributing

1. Fork it
2. Create your feature branch (git checkout -b my-new-feature)
3. Commit your changes (git commit -am 'Add some feature')
4. Push to the branch (git push origin my-new-feature)
5. Create new Pull Request
