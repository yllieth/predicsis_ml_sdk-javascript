angular.module('demo-jsSDK', ['predicsis.jsSDK'])
  .config(function(predicsisAPIProvider) {
    predicsisAPIProvider.setBaseUrl('http://localhost:8003');
  })

  .run(function(predicsisAPI) {
    predicsisAPI.setOauthToken(false);
    predicsisAPI.setErrorHandler(console.log.bind(console));
  })

  .controller('ExampleCtrl', function(predicsisAPI) {
    var self = this;

    // projects list
    //predicsisAPI.Projects.all().then(function(projectList) { self.output = projectList; })

    // dictionary creation
    self.output = 'Waiting fo async promise...'
    predicsisAPI.Dictionaries
      .create({dataset_id: '53c7dea470632d3417020000', name: 'My dictionary'})
      .then(function(dictionary) {
        self.output = dictionary;
      });
  });
