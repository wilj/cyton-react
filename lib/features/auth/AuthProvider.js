import React, { useState } from 'react';
import { KeycloakProvider } from '@react-keycloak/web';
import Keycloak from 'keycloak-js';
import { createClient, debugExchange, fetchExchange, Provider as UrqlClientProvider, subscriptionExchange } from 'urql';
import { SubscriptionClient } from 'subscriptions-transport-ws';
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
    var clients = useState(function () { return createAuthClients(baseDomain, realm, clientId, apiDomain); })[0];
    var loading = busyElement || React.createElement("div", { className: "cyton-loading" }, "Loading...");
    if (clients) {
        console.log("using clients", clients);
        return (React.createElement(KeycloakProvider, { LoadingComponent: loading, keycloak: clients.keycloak },
            React.createElement(UrqlClientProvider, { value: clients.urqlClient }, children)));
    }
    return React.createElement("div", null, "`Loading clients...`");
};
