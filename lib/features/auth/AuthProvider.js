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
import React, { useState, useCallback, useMemo } from 'react';
import { KeycloakProvider } from '@react-keycloak/web';
import Keycloak from 'keycloak-js';
import { createClient, debugExchange, fetchExchange, Provider as UrqlClientProvider, subscriptionExchange, } from 'urql';
import { SubscriptionClient } from 'subscriptions-transport-ws';
import { AuthContext, AuthApiContext } from './AuthContext';
export function createAuthClients(baseDomain, realm, clientId, apiDomain) {
    var authUrl = "https://auth." + baseDomain + "/auth";
    var keycloak = Keycloak({ url: authUrl, realm: realm, clientId: clientId });
    // TODO FIXME urls need to be props
    var baseGraphqlUrl = apiDomain ? ("://" + apiDomain + "/graphql") : "://admin." + baseDomain + "/graphql";
    var subscriptionClient = new SubscriptionClient("wss" + baseGraphqlUrl, {});
    var graphqlUrl = "https" + baseGraphqlUrl;
    console.log("Creating graphql client with url: " + graphqlUrl);
    var urqlClient = createClient({
        url: graphqlUrl,
        fetchOptions: function () {
            return keycloak.token
                ? {
                    credentials: 'include',
                    headers: {
                        Authorization: "Bearer " + keycloak.token,
                    },
                }
                : {};
        },
        exchanges: [
            debugExchange,
            /*
            TODO FIXME make this configurable
            // cacheExchange is disabled by default
            cacheExchange,
            */
            fetchExchange,
            subscriptionExchange({
                forwardSubscription: function (operation) {
                    return subscriptionClient.request(operation);
                },
            }),
        ],
    });
    return { keycloak: keycloak, urqlClient: urqlClient, subscriptionClient: subscriptionClient };
}
export var AuthProvider = function (_a) {
    var baseDomain = _a.baseDomain, realm = _a.realm, clientId = _a.clientId, apiDomain = _a.apiDomain, busyElement = _a.busyElement, children = _a.children;
    var _b = useState({}), auth = _b[0], setAuth = _b[1];
    var clients = useMemo(function () { return createAuthClients(baseDomain, realm, clientId, apiDomain); }, [baseDomain, realm, apiDomain]);
    var login = useCallback(function () { return clients.keycloak.login({ scope: 'profile' }); }, []);
    var logout = useCallback(function () {
        setAuth(function (state) { return ({}); });
        clients.keycloak.logout();
    }, []);
    var authApi = useMemo(function () { return ({ login: login, logout: logout, setUser: function (user) { return setAuth(__assign(__assign({}, auth), { user: user })); } }); }, []);
    var loading = busyElement || React.createElement("div", { className: "cyton-loading" }, "Loading...");
    var handleKeycloakEvent = function (event, error) {
        if (auth.token !== clients.keycloak.token) {
            setAuth(__assign(__assign({}, auth), { token: clients.keycloak.token }));
        }
    };
    console.log("using clients", clients);
    return (React.createElement(KeycloakProvider, { onEvent: handleKeycloakEvent, LoadingComponent: loading, keycloak: clients.keycloak },
        React.createElement(UrqlClientProvider, { value: clients.urqlClient },
            React.createElement(AuthContext.Provider, { value: auth },
                React.createElement(AuthApiContext.Provider, { value: authApi }, children)))));
};
