import React, { useState } from 'react'
import { KeycloakProvider } from '@react-keycloak/web'
import Keycloak from 'keycloak-js'
import {
    createClient,
    debugExchange,
    fetchExchange,
    Provider as UrqlClientProvider,
    subscriptionExchange
} from 'urql'
import { SubscriptionClient } from 'subscriptions-transport-ws'

export interface AuthClients {
    keycloak: any
    urqlClient: any
    subscriptionClient: any
}

export function createAuthClients(baseDomain: string, realm: string, clientId: string, apiDomain?: string) : AuthClients {
    const authUrl = `https://auth.${baseDomain}/auth`

    const keycloak = Keycloak({  url: authUrl, realm, clientId })
    
    // TODO FIXME urls need to be props
    const baseGraphqlUrl = apiDomain ? (`://${apiDomain}/graphql`) : `://admin.${baseDomain}/graphql`
    const subscriptionClient = new SubscriptionClient(`wss${baseGraphqlUrl}`, {})
    const graphqlUrl = `https${baseGraphqlUrl}`
    
    console.log(`Creating graphql client with url: ${graphqlUrl}`)
    const urqlClient = createClient({
        url: graphqlUrl,
        fetchOptions: () => {
            return keycloak.token
                ? {
                      credentials: 'include',
                      headers: {
                          Authorization: `Bearer ${keycloak.token}`,
                      },
                  }
                : {}
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
                forwardSubscription: (operation:any) =>
                    subscriptionClient.request(operation),
            }),
        ],
    })
    
    return {keycloak, urqlClient, subscriptionClient}    
}


export type AuthProviderProps = {
    baseDomain: string
    realm: string
    clientId: string
    apiDomain?: string
    busyElement?: JSX.Element
}

export const AuthProvider: React.FC<AuthProviderProps> = ({
    baseDomain,
    realm,
    clientId,
    apiDomain,
    busyElement,
    children,
}) => {

    const [clients] = useState(() => createAuthClients(baseDomain, realm, clientId, apiDomain))
    

    const loading = busyElement || <div className="cyton-loading">Loading...</div> 
        
    if (clients) {
        console.log(`using clients`, clients)
        return (
            <KeycloakProvider
                LoadingComponent={ loading }
                keycloak={clients.keycloak}
            >
                <UrqlClientProvider value={clients.urqlClient}>
                    {children}
                </UrqlClientProvider>
            </KeycloakProvider>
        )
    }

    return <div>`Loading clients...`</div>

}
