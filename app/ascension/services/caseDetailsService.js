'use strict';
/*jshint camelcase: false */
angular.module('RedhatAccess.ascension').service('CaseDetailsService', [
    'udsService',
    'AlertService',
    'RHAUtils',
    'securityService',
    'RoutingService',
    'UQL',
    function (udsService, AlertService, RHAUtils,securityService, RoutingService,UQL) {
		this.caseDetailsLoading = false;
		this.kase = {};
        this.cases = {};

		this.getCaseDetails = function(caseNumber) {
			this.caseDetailsLoading = true;
			udsService.kase.details.get(caseNumber).then(angular.bind(this, function (response) {
				this.kase = response;
				this.caseDetailsLoading = false;
			}), angular.bind(this, function (error) {
				AlertService.addStrataErrorMessage(error);
				this.caseDetailsLoading = false;
	        }));
		};

        this.extractRoutingRoles = function(user) {
            var roleNames, _ref;
            roleNames = [];
            if ((user != null ? (_ref = user.roles) != null ? _ref.length : void 0 : void 0) > 0) {
                angular.forEach(user.roles, function(r) {
                    if (RoutingService.mapping[r.resource.name.toLowerCase()] != null) {
                        return roleNames.push(r.resource.name.toLowerCase());
                    }
                });
            }
            return roleNames;
        };
		this.getYourCases = function() {
            var uql, userRoles, ssoUserName, uqlParts,finalUql;
            uqlParts = [];
            var self = this;
            ssoUserName = securityService.loginStatus.authedUser.sso_username+"\"";
            udsService.user.get("SSO is \"" + ssoUserName + "\"").then(angular.bind(this, function (user){
                if ((user == null) || ((user != null ? user[0].externalModelId : void 0) == null)) {
                    console.error("Was not able to fetch user given ssoUserName");
                }
                else{
                    userRoles = this.extractRoutingRoles(user);
                    if ((userRoles != null ? userRoles.length : void 0) > 0) {
                        console.log("Discovered roles on the user: " + userRoles);
                        //}
                        //else if (user.sbrs == null) {
                        //    console.log("No sbrs found on user.");
                        //        userRoles = [RoutingRoles.key_mapping.OWNED_CASES];
                    } else {
                        console.log("No url roles or user roles found.");
                        userRoles = [RoutingService.key_mapping.OWNED_CASES, RoutingService.key_mapping.COLLABORATION, RoutingService.key_mapping.FTS];
                    }
                    angular.forEach(userRoles, function(r){
                        uqlParts.push(RoutingService.mapping[r](user[0]));
                    });
                    finalUql = uqlParts.join(' or ');

                    var secureHandlingUQL = UQL.cond('requiresSecureHandling', 'is', false);
                    finalUql = UQL.and(finalUql, secureHandlingUQL);

                    var promise = udsService.cases.list(finalUql,'Minimal',6);
                    promise.then(angular.bind(this, function (topCases) {
                        self.cases = topCases;
                        console.log(self.cases.length)
                    }), function (error) {
                        AlertService.addStrataErrorMessage(error);
                    });
                }
            }),angular.bind(this, function (error) {
                    AlertService.addStrataErrorMessage(error);
                })
            );
		};
	}
]);
