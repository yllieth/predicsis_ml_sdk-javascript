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
