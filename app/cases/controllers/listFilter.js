'use strict';
 /*jshint camelcase: false */
angular.module('RedhatAccess.cases')
.controller('ListFilter', [
  '$scope',
  'strataService',
  'STATUS',
  'CaseListService',
  'securityService',
  'AlertService',
  '$rootScope',
  'AUTH_EVENTS',
  function ($scope,
            strataService,
            STATUS,
            CaseListService,
            securityService,
            AlertService,
            $rootScope,
            AUTH_EVENTS) {

    $scope.groups = [];
    $scope.securityService = securityService;

    $scope.groupsLoading = true;
    $scope.loadGroups = function() {
      strataService.groups.list().then(
          function(groups) {
            $scope.groups = groups;
            $scope.groupsLoading = false;
          },
          function(error) {
            AlertService.addStrataErrorMessage(error);
          }
      );
    };
    $scope.loadGroups();

    $rootScope.$on(AUTH_EVENTS.loginSuccess, function() {
      $scope.loadGroups();
      AlertService.clearAlerts();
    });

    $scope.statusFilter = STATUS.both;

    var getIncludeClosed = function() {
      if ($scope.statusFilter === STATUS.open) {
        return false;
      } else if ($scope.statusFilter === STATUS.closed) {
        return true;
      } else if ($scope.statusFilter === STATUS.both) {
        return true;
      }

      return false;
    };

    $scope.onFilterKeyPress = function($event) {
      if ($event.keyCode === 13) {
        $scope.doFilter();
      }
    };

    $scope.doFilter = function() {

      if (angular.isFunction($scope.prefilter)) {
        $scope.prefilter();
      }

      var params = {
        include_closed: getIncludeClosed(),
        count: 50
      };

      if ($scope.keyword != null) {
        params.keyword = $scope.keyword;
      }

      if ($scope.group != null) {
        params.group_numbers = {
          group_number: [$scope.group.number]
        };
      }

      if ($scope.statusFilter === STATUS.closed) {
        params.status = STATUS.closed;
      }

      strataService.cases.filter(params).then(
          function(filteredCases) {
            if (filteredCases === undefined) {
              CaseListService.defineCases([]);
            } else {
              CaseListService.defineCases(filteredCases);
            }

            if (angular.isFunction($scope.postfilter)) {
              $scope.postfilter();
            }
          }
      );
    };
  }
]);
