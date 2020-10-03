var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import { useKeycloak } from '@react-keycloak/web';
import { useEffect, useContext } from 'react';
import * as Urql from 'urql';
import gql from 'graphql-tag';
import { getLocalStorage } from '../state/useLocalStorage';
import { AuthContext, AuthApiContext } from './AuthContext';
var storageKey = "auth";
var saveState = function (state) {
    getLocalStorage().setItem(storageKey, JSON.stringify(state));
};
var loadState = function () {
    var state = JSON.parse(getLocalStorage().getItem(storageKey) || JSON.stringify({}));
    return state;
};
export var useAuth = function (overrides) {
    var _a, _b;
    var keycloak = useKeycloak()[0];
    var auth = useContext(AuthContext);
    var api = useContext(AuthApiContext);
    var _c = Urql.useMutation(gql(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n        mutation RegisterUser($input: RegisterUserInput!) {\n            registerUser(input: $input) {\n                userSessions {\n                id\n                externalId\n                preferredUsername\n                jwt\n                }\n            }\n        }\n    "], ["\n        mutation RegisterUser($input: RegisterUserInput!) {\n            registerUser(input: $input) {\n                userSessions {\n                id\n                externalId\n                preferredUsername\n                jwt\n                }\n            }\n        }\n    "])))), registerResponse = _c[0], register = _c[1];
    var userSessions = (_b = (_a = registerResponse.data) === null || _a === void 0 ? void 0 : _a.registerUser) === null || _b === void 0 ? void 0 : _b.userSessions;
    var user = userSessions && userSessions[0];
    useEffect(function () {
        api.setUser(user);
        return function () { };
    }, [user]);
    useEffect(function () {
        if (auth.token) {
            register({ input: {} });
        }
        return function () { };
    }, [auth.token]);
    var hasRole = function (role) {
        return (auth.user && auth.user.jwt.realm_access.roles.indexOf(role) !== -1) ||
            false;
    };
    return __assign(__assign({ auth: auth }, api), { hasRole: hasRole });
};
var templateObject_1;
