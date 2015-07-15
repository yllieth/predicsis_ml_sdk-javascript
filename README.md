# PredicSis ML SDK for Javascript.

The official PredicSis ML SDK for Javascript (for pure frontend applications, without node).

## Installation

Add PredicSis ML SDK into your `bower.json`

```shell
bower install predicsis_ml_sdk-javascript --save-dev
```

## Configuration

If you want to change PredicSis API host, add these lines to your `app.js` configuration file.

```javascript
angular.module('YourAngularApplication', ['predicsis.jsSDK'])
  .config(function(predicsisAPIProvider, config) {
    predicsisAPIProvider.setBaseUrl('https://predicsis_api_host');
    predicsisAPIProvider.setOauthToken('4V83j2BWgcPONK8Xw8P7953yPvnTzz784V83j2BWgcPONK8Xw8P7953yPvnTzz78');
  })

  .controller('ExampleCtrl', function(predicsisAPI) {
    var self = this;
    predicsisAPI.Datasets.all().then(function(datasetList) { self.datasets = datasetList; });
  });
```

You can also setup your personal access token within a _run_ context. This can be useful if your token is stored in a
cookie or in localStorage.

```javascript
angular.module('YourAngularApplication', ['predicsis.jsSDK'])
  .config(function(predicsisAPIProvider) {
    predicsisAPIProvider.setBaseUrl('http://localhost:8003');
  })

  .run(function(predicsisAPI, $cookieStore) {
    predicsisAPI.setOauthToken($cookieStore.get('session'));
    predicsisAPI.setErrorHandler(console.log.bind(console));
  })

  .controller('ExampleCtrl', function(predicsisAPI) {
    var self = this;
    predicsisAPI.Datasets.all().then(function(datasetList) { self.datasets = datasetList; });
  });
```

Default values:
- api endpoint: `https://api.predicsis.com`
- error handler: `throw Error(response);`
- oauth access token: `no-token-defined`

## Getting Started

You can start using our SDK assuming you already have a [user token](https://developer.predicsis.com/doc/v1/overview/oauth2/#get-authorization-from-a-user)

Once you're done, you can send API request easily:

- list projects: 
    ```
    predicsisAPI.Projects
      .all()
      .then(function(projectList) { console.log(projectList); })
    ```
- generate a dictionary from a dataset:
    ```
    predicsisAPI.Dictionaries
      .create({dataset_id: '53c7dea470632d3417020000', name: 'My dictionary'})
      .then(function(dictionary) { console.log(dictionary); });
    ```
- start a learn process:
    ```
    predicsisAPI.Models.learn(project)
    ```
- ...

See the [SDK documentation](http://yllieth.github.io/predicsis_ml_sdk-javascript) for more examples.

## Upload a file to S3

```javascript
//Get an HTML5 File instance
fileInput.addEventListener('change', function(evt) {
  var file = evt.target.files[0];
  s3FileHelper
    .upload(file, function progressHandler(event) {
      //Update a progress bar using standard XMLHttpRequestProgressEvent
    })
    .then(function(params) {
      //file successfully uploaded to s3
      var filename = params.filename;
      var key = params.key;//S3 key
    })
    .catch(function(err){

    });
});
```

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
