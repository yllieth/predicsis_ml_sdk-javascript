angular.module('predicsis.jsSDK', ['restangular'])
  .provider('predicsisAPI', function () {
    var baseURL;
    var oauthToken;

    this.setBaseUrl = function(url) { baseURL = url; };
    this.getBaseUrl = function() { return baseURL; };

    this.setOauthToken = function(token) { oauthToken = token; };
    this.getOauthToken = function() { return oauthToken; };

    this.$get = function(Restangular, Datasets, Dictionaries, Jobs, Modalities, Models, PreparationRules, Projects, Reports, Sources, Uploads, Users, Variables, jobsHelper, modelHelper, projectsHelper) {
      Restangular.setBaseUrl(this.getBaseUrl());
      Restangular.setDefaultHeaders({ accept: 'application/json' });
      Restangular.addResponseInterceptor(function(data, operation, what, url, response) {
        //operation is one of 'getList', 'post', 'get', 'patch'
        if (['getList', 'post', 'get', 'patch'].indexOf(operation) > -1) {
          //Any api response except 204 - No-Content is an object (wrapping either an object or an array)
          if(response.status !== 204) {
            // replace { tokens: [ {}, {}, ... ]} by [ {}, {}, ... ]
            var resourceName = Object.keys(data)[0];
            if (resourceName) {
              data = data[resourceName];
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
        PreparationRules: PreparationRules,
        Projects: Projects,
        Reports: Reports,
        Sources: Sources,
        Uploads: Uploads,
        Users: Users,
        Variables: Variables,

        jobsHelper: jobsHelper,
        modelHelper: modelHelper,
        projectsHelper: projectsHelper
      };
    };
  });
