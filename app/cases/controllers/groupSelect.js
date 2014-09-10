/*jshint camelcase: false */
'use strict';
angular.module('RedhatAccess.cases').constant('CASE_GROUPS', {
    manage: 'manage',
    ungrouped: 'ungrouped'
}).controller('GroupSelect', [
    '$scope',
    'securityService',
    'SearchCaseService',
    'CaseService',
    'strataService',
    'AlertService',
    'CASE_GROUPS',
    'AUTH_EVENTS',
    function ($scope, securityService, SearchCaseService, CaseService, strataService, AlertService, CASE_GROUPS, AUTH_EVENTS) {
        $scope.securityService = securityService;
        $scope.SearchCaseService = SearchCaseService;
        $scope.CaseService = CaseService;
        $scope.CASE_GROUPS = CASE_GROUPS;
        $scope.groupOptions = [];

        var buildGroupOptions = function() {
            var sep = '────────────────────────────────────────';
            CaseService.populateGroups().then(function(groups){
                $scope.groupOptions = [];
                groups.sort(function(a, b){
                    if(a.name < b.name) { return -1; }
                    if(a.name > b.name) { return 1; }
                    return 0;
                });

                var defaultGroup = '';
                var sep = '────────────────────────────────────────';
                if ($scope.showsearchoptions) {
                    $scope.groupOptions.push({
                        value: '',
                        label: 'All Groups'
                    }, {
                        value: CASE_GROUPS.ungrouped,
                        label: 'Ungrouped Cases'
                    }, {
                        isDisabled: true,
                        label: sep
                    });
                }
                var updateGroupOptions = true;
                angular.forEach(groups, function(group){
                    if (updateGroupOptions) {
                        if (group.is_default) {
                            if ($scope.showsearchoptions === false) {
                                $scope.groupOptions = [];
                                defaultGroup = group.number;
                                $scope.CaseService.group = defaultGroup;
                                CaseService.onGroupSelectChanged();                        
                                updateGroupOptions = false;
                            }                            
                        }
                        $scope.groupOptions.push({
                            value: group.number,
                            label: group.name
                        });
                    }                                        
                });
                if ($scope.showsearchoptions) {
                    $scope.groupOptions.push({
                        isDisabled: true,
                        label: sep
                    }, {
                        value: CASE_GROUPS.manage,
                        label: 'Manage Case Groups'
                    });
                }
            });
        };
        buildGroupOptions();
        $scope.authLoginEvent = $scope.$on(AUTH_EVENTS.loginSuccess, function () {
            buildGroupOptions();
        });

        $scope.$on('$destroy', function () {
            // Clean up listeners
            $scope.authLoginEvent();
        });
    }
]);
