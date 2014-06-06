'use strict';
 /*global $ */

angular.module('RedhatAccess.header', [])
  .value('TITLE_VIEW_CONFIG', {
    show: 'false',
    titlePrefix: 'Red Hat Access: ',
    searchTitle: 'Search',
    caseListTitle: 'Support Cases',
    caseViewTitle: 'View/Modify Case',
    newCaseTitle: 'New Support Case',
    searchCaseTitle: 'Search Support Cases',
    logViewerTitle: 'Log'
  })
  .controller('TitleViewCtrl', ['TITLE_VIEW_CONFIG', '$scope',
    function(TITLE_VIEW_CONFIG, $scope) {
      $scope.showTitle = TITLE_VIEW_CONFIG.show;
      $scope.titlePrefix = TITLE_VIEW_CONFIG.titlePrefix;
      $scope.getPageTitle = function() {
        switch ($scope.page) {
          case 'search':
            return TITLE_VIEW_CONFIG.searchTitle;
          case 'caseList':
            return TITLE_VIEW_CONFIG.caseListTitle;
          case 'caseView':
            return TITLE_VIEW_CONFIG.caseViewTitle;
          case 'newCase':
            return TITLE_VIEW_CONFIG.newCaseTitle;
          case 'logViewer':
            return TITLE_VIEW_CONFIG.logViewerTitle;
          case 'searchCase':
            return TITLE_VIEW_CONFIG.searchCaseTitle;
          default:
            console.log('Invalid title key' + $scope.page);
            return '';
        }
      };
    }
  ])
  .directive('rhaTitleTemplate',
    function() {
      return {
        restrict: 'AE',
        scope: {
          page: '@'
        },
        templateUrl: 'common/views/title.html',
        controller: 'TitleViewCtrl'
      };
    })
  .service('AlertService', ['$filter', 'AUTH_EVENTS', '$rootScope',
    function($filter, AUTH_EVENTS, $rootScope) {
      var ALERT_TYPES = {
        DANGER: 'danger',
        SUCCESS: 'success',
        WARNING: 'warning'
      };

      this.alerts = []; //array of {message: 'some alert', type: '<type>'} objects

      this.clearAlerts = function() {
        this.alerts = [];
      };

      this.addAlert = function(alert) {
        this.alerts.push(alert);
      };

      this.removeAlert = function(alert) {
        this.alerts.splice(this.alerts.indexOf(alert), 1);
      };

      this.addDangerMessage = function(message) {
        return this.addMessage(message, ALERT_TYPES.DANGER);
      };

      this.addSuccessMessage = function(message) {
        return this.addMessage(message, ALERT_TYPES.SUCCESS);
      };

      this.addWarningMessage = function(message) {
        return this.addMessage(message, ALERT_TYPES.WARNING);
      };

      this.addMessage = function(message, type) {
        var alert = {
          message: message,
          type: type === null ? 'warning' : type
        };
        this.addAlert(alert);

        $('body,html').animate({
          scrollTop: $('body').offset().top
        }, 100);

        //Angular adds a unique hash to each alert during data binding,
        //so the returned alert will be unique even if the
        //message and type are identical.
        return alert;
      };

      this.getErrors = function() {
        var errors = $filter('filter')(this.alerts, {
          type: ALERT_TYPES.DANGER
        });

        if (errors === null) {
          errors = [];
        }

        return errors;
      };

      this.addStrataErrorMessage = function(error) {
        var existingMessage =
          $filter('filter')(this.alerts, {
            type: ALERT_TYPES.DANGER,
            message: error.message
          });

        if (existingMessage.length < 1) {
          this.addDangerMessage(error.message);
        }
      };

      $rootScope.$on(AUTH_EVENTS.logoutSuccess, angular.bind(this,
        function() {
          this.clearAlerts();
          this.addMessage('You have successfully logged out of the Red Hat Customer Portal.');
        }));
      $rootScope.$on(AUTH_EVENTS.loginSuccess, angular.bind(this,
        function() {
          this.clearAlerts();
        }));

    }
  ])
  .directive('rhaAlert',
    function() {
      return {
        templateUrl: 'common/views/alert.html',
        restrict: 'E',
        controller: 'AlertController'
      };
    })
  .controller('AlertController', ['$scope', 'AlertService',
    function($scope, AlertService) {
      $scope.AlertService = AlertService;

      $scope.closeable = true;

      $scope.closeAlert = function(index) {
        AlertService.alerts.splice(index, 1);
      };

      $scope.dismissAlerts = function() {
        AlertService.clearAlerts();
      };
    }
  ])
  .directive('rhaHeader',
    function() {
      return {
        templateUrl: 'common/views/header.html',
        restrict: 'E',
        scope: {
          page: '@'
        },
        controller: 'HeaderController'
      };
    })
  .controller('HeaderController', ['$scope', 'AlertService',
    function($scope, AlertService) {
      /**
       * For some reason the rhaAlert directive's controller is not binding to the view.
       * Hijacking rhaAlert's parent controller (HeaderController) works
       * until a real solution is found.
       */
      $scope.AlertService = AlertService;

      $scope.closeable = true;

      $scope.closeAlert = function(index) {
        AlertService.alerts.splice(index, 1);
      };

      $scope.dismissAlerts = function() {
        AlertService.clearAlerts();
      };
    }
  ]).factory('configurationService', ['$q',
    function($q) {
      var defer = $q.defer();
      var service = {
        setConfig: function(config) {
          defer.resolve(config);
        },
        getConfig: function() {
          return defer.promise;
        }
      };
      return service;
    }
  ]);
