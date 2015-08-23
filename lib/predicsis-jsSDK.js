angular.module('predicsis.jsSDK.models', []);
angular.module('predicsis.jsSDK.helpers', []);

angular
  .module('predicsis.jsSDK', ['predicsis.jsSDK.models', 'predicsis.jsSDK.helpers', 'restangular'])
  .provider('predicsisAPI', function () {
    'use strict';

    var errorHandler = function(response) { throw Error(response); };
    var baseURL = 'https://api.predicsis.com';
    var oauthToken = 'no-token-defined';
    var requestHeaders = {
      Accept: 'application/json'
    };

    this.setErrorHandler = function(handler) { errorHandler = handler; };

    this.setBaseUrl = function(url) { baseURL = url; };
    this.getBaseUrl = function() { return baseURL; };

    this.getOauthToken = function() { return oauthToken; };
    this.hasOauthToken = function() { return Boolean(oauthToken === undefined); };
    this.setOauthToken = function(token) {
      if (token !== false) {
        requestHeaders.Authorization = token;
        oauthToken = token;
      }
    };

    this.$get = function(Restangular, uploadHelper,
                         Datafiles, Datasets, Dictionaries, Jobs, Modalities, Models, OauthTokens, OauthApplications,
                         PreparationRules, Projects, Reports, UserSettings, Sources, Users, Variables) {
      var self = this;

      Restangular.setBaseUrl(this.getBaseUrl());
      Restangular.setDefaultHeaders(requestHeaders);
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
        Datafiles: Datafiles,
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
        Users: Users,
        UserSettings: UserSettings,
        Variables: Variables,

        uploadHelper: uploadHelper,
        _restangular: Restangular,
        setOauthToken: function(token) {
          self.setOauthToken(token);
          Restangular.setDefaultHeaders(requestHeaders);
        },
        setErrorHandler: function(handler) {
          self.setErrorHandler(handler);
        }
      };
    };
  });
