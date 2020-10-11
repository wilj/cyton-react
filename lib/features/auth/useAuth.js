var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
import { useKeycloak } from '@react-keycloak/web';
import { useEffect, useCallback } from 'react';
import * as Urql from 'urql';
import gql from 'graphql-tag';
export var useAuth = function (overrides) {
    var _a, _b;
    var _c = Urql.useMutation(gql(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n        mutation RegisterUser($input: RegisterUserInput!) {\n            registerUser(input: $input) {\n                userSessions {\n                id\n                externalId\n                preferredUsername\n                jwt\n                }\n            }\n        }\n    "], ["\n        mutation RegisterUser($input: RegisterUserInput!) {\n            registerUser(input: $input) {\n                userSessions {\n                id\n                externalId\n                preferredUsername\n                jwt\n                }\n            }\n        }\n    "])))), registerResponse = _c[0], register = _c[1];
    var userSessions = (_b = (_a = registerResponse.data) === null || _a === void 0 ? void 0 : _a.registerUser) === null || _b === void 0 ? void 0 : _b.userSessions;
    var user = userSessions && userSessions[0];
    var keycloak = useKeycloak().keycloak;
    var login = useCallback(function () {
        if (keycloak) {
            keycloak.login({ scope: 'profile' });
        }
    }, [keycloak]);
    var logout = useCallback(function () {
        if (keycloak) {
            keycloak.logout();
        }
    }, [keycloak]);
    useEffect(function () {
        register({ input: {} });
        return function () { };
    }, [keycloak === null || keycloak === void 0 ? void 0 : keycloak.token]);
    var hasRole = function (role) {
        return (user && user.jwt.realm_access.roles.indexOf(role) !== -1) ||
            false;
    };
    return { auth: { user: user, token: keycloak === null || keycloak === void 0 ? void 0 : keycloak.token }, login: login, logout: logout, hasRole: hasRole };
};
var templateObject_1;
