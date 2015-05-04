angular.module('predicsis.jsSDK', ['restangular'])
  .provider('predicsisAPI', function () {
    var baseURL = 'https://api.predicsis.com';
    var oauthToken = '';

    this.setBaseUrl = function(url) { baseURL = url; };
    this.getBaseUrl = function() { return baseURL; };

    this.setOauthToken = function(token) { oauthToken = token; };
    this.getOauthToken = function() { return oauthToken; };
    this.hasOauthToken = function() { return Boolean(oauthToken === undefined); };

    this.$get = function(Restangular, Datasets, Dictionaries, Jobs, Modalities, Models, OauthTokens, OauthApplications, PreparationRules, Projects, Reports, UserSettings, Sources, Uploads, Users, Variables, jobsHelper, modelHelper, projectsHelper) {
      var self = this;

      Restangular.setBaseUrl(this.getBaseUrl());
      Restangular.setDefaultHeaders({ accept: 'application/json', Authorization: 'Bearer ' + this.getOauthToken() });
      Restangular.addResponseInterceptor(function(data, operation, what, url, response) {
        //operation is one of 'getList', 'post', 'get', 'patch'
        if (['getList', 'post', 'get', 'patch'].indexOf(operation) > -1) {
          //Any api response except 204 - No-Content is an object (wrapping either an object or an array)
          if(response.status !== 204) {
            // replace { tokens: [ {}, {}, ... ]} by [ {}, {}, ... ]
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

        jobsHelper: jobsHelper,
        modelHelper: modelHelper,
        projectsHelper: projectsHelper,

        _restangular: Restangular,
        setOauthToken: function(token) {
          self.setOauthToken(token);
        }
      };
    };
  });
