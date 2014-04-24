'use strict';

angular.module('RedhatAccess.cases')
.controller('CompactCaseList', [
  '$scope',
  '$stateParams',
  'strataService',
  'CaseService',
  'CaseListService',
  '$rootScope',
  'AUTH_EVENTS',
  'securityService',
  'AlertService',
  function(
      $scope,
      $stateParams,
      strataService,
      CaseService,
      CaseListService,
      $rootScope,
      AUTH_EVENTS,
      securityService,
      AlertService) {

    $scope.securityService = securityService;
    $scope.CaseService = CaseService;
    $scope.CaseListService = CaseListService;
    $scope.loadingCaseList = true;
    $scope.selectedCaseIndex = -1;

    $scope.selectCase = function($index) {
      $scope.selectedCaseIndex = $index;

      CaseService.clearCase();
    };

    $scope.domReady = false; //used to notify resizable directive that the page has loaded
    $scope.filterCases = function() {
      strataService.cases.filter().then(
          function(cases) {
            $scope.loadingCaseList = false;
            CaseListService.defineCases(cases);
            $scope.domReady = true;
          },
          function(error) {
            AlertService.addStrataErrorMessage(error);
          }
      );
    };

    $rootScope.$on(AUTH_EVENTS.loginSuccess, function() {
      CaseService.populateGroups();
      $scope.filterCases();
      AlertService.clearAlerts();
    });

    /**
     * Passed to rha-list-filter as a callback after filtering
     */
    $scope.filterCallback = function() {
      $scope.loadingCaseList = false;
    };

    $scope.onFilter = function() {
      $scope.loadingCaseList = true;
    };

    CaseService.populateGroups();
    $scope.filterCases();
  }
]);