'use strict';

angular.module('RedhatAccessCases')
.directive('rhaCompactCaseList', function () {
  return {
    templateUrl: 'cases/views/compactCaseList.html',
    controller: 'CompactCaseList',
    scope: {
    },
    restrict: 'EA',
    link: function postLink(scope, element, attrs) {
    }
  };
});
