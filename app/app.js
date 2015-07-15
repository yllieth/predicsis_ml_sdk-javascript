angular.module('demo-jsSDK', ['predicsis.jsSDK'])
  .config(function(predicsisAPIProvider) {
    predicsisAPIProvider.setBaseUrl('http://localhost:8003');
  })

  .run(function(predicsisAPI) {
    predicsisAPI.setOauthToken('d75d2750e04ab0c3c6f44a20271496098600d22e602a6e002deacfa5b07be6c5');
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
