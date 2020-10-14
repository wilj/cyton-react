import React, { useState } from 'react';
import { KeycloakProvider } from '@react-keycloak/web';
import Keycloak from 'keycloak-js';
import { cacheExchange, createClient, debugExchange, fetchExchange, Provider as UrqlClientProvider, subscriptionExchange, } from 'urql';
import { SubscriptionClient } from 'subscriptions-transport-ws';
export function createAuthClients(props) {
    var authDomain = props.authDomain, realm = props.realm, clientId = props.clientId, apiDomain = props.apiDomain, cacheEnabled = props.cacheEnabled;
    var authUrl = "https://" + authDomain + "/auth";
    var keycloak = Keycloak({ url: authUrl, realm: realm, clientId: clientId });
    // TODO FIXME urls need to be props
    var baseGraphqlUrl = "://" + apiDomain + "/graphql";
    var subscriptionClient = new SubscriptionClient("wss" + baseGraphqlUrl, {});
    var graphqlUrl = "https" + baseGraphqlUrl;
    console.log("Creating graphql client with url: " + graphqlUrl);
    console.log("URQL cache enabled: " + cacheEnabled);
    var exchanges = [debugExchange];
    if (cacheEnabled) {
        exchanges.push(cacheExchange);
    }
    exchanges.push(fetchExchange);
    exchanges.push(subscriptionExchange({
        forwardSubscription: function (operation) { return subscriptionClient.request(operation); },
    }));
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
        exchanges: exchanges,
    });
    return { keycloak: keycloak, urqlClient: urqlClient, subscriptionClient: subscriptionClient };
}
export var AuthProvider = function (props) {
    var busyElement = props.busyElement, children = props.children;
    var clients = useState(function () { return createAuthClients(props); })[0];
    var loading = busyElement || React.createElement("div", { className: "cyton-loading" }, "Loading...");
    if (clients) {
        console.log("using clients", clients);
        return (React.createElement(KeycloakProvider, { LoadingComponent: loading, keycloak: clients.keycloak },
            React.createElement(UrqlClientProvider, { value: clients.urqlClient }, children)));
    }
    return React.createElement("div", null, "`Loading clients...`");
};
