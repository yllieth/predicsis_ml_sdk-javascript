angular.module('demo-jsSDK', ['predicsis.jsSDK'])
  .config(function(predicsisAPIProvider) {
    predicsisAPIProvider.setBaseUrl('http://localhost:8003');
    predicsisAPIProvider.setOauthToken('d75d2750e04ab0c3c6f44a20271496098600d22e602a6e002deacfa5b07be6c5');
  })

  .controller('ExampleCtrl', function(predicsisAPI) {
    var self = this;
    predicsisAPI.Projects.all().then(function(projectList) { self.projects = projectList; })
  });
