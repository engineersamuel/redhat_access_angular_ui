'use strict';

angular.module('RedhatAccessCases')
.controller('AttachmentsSection', [
  '$scope',
  'AttachmentsService',
  'CaseService',
  function(
      $scope,
      AttachmentsService,
      CaseService) {

    $scope.AttachmentsService = AttachmentsService;
    $scope.CaseService = CaseService;
  }
]);
