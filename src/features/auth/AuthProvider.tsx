import React, { useState } from 'react'
import { KeycloakProvider } from '@react-keycloak/web'
import Keycloak from 'keycloak-js'
import {
    cacheExchange,
    createClient,
    debugExchange,
    fetchExchange,
    Provider as UrqlClientProvider,
    subscriptionExchange,
} from 'urql'
import { SubscriptionClient } from 'subscriptions-transport-ws'

export interface AuthClients {
    keycloak: any
    urqlClient: any
    subscriptionClient: any
}

export type AuthProviderProps = {
    authDomain: string
    realm: string
    clientId: string
    apiDomain: string
    busyElement?: JSX.Element
    cacheEnabled?: boolean
}

export function createAuthClients(props: AuthProviderProps): AuthClients {
    const { authDomain, realm, clientId, apiDomain, cacheEnabled } = props
    const authUrl = `https://${authDomain}/auth`

    const keycloak = Keycloak({ url: authUrl, realm, clientId })

    // TODO FIXME urls need to be props
    const baseGraphqlUrl = `://${apiDomain}/graphql`
    const subscriptionClient = new SubscriptionClient(`wss${baseGraphqlUrl}`, {})
    const graphqlUrl = `https${baseGraphqlUrl}`

    console.log(`Creating graphql client with url: ${graphqlUrl}`)
    console.log(`URQL cache enabled: ${cacheEnabled}`)

    const exchanges = [debugExchange]
    if (cacheEnabled) {
        exchanges.push(cacheExchange)
    }
    exchanges.push(fetchExchange)
    exchanges.push(
        subscriptionExchange({
            forwardSubscription: (operation: any) => subscriptionClient.request(operation),
        })
    )

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
        exchanges,
    })

    return { keycloak, urqlClient, subscriptionClient }
}

export const AuthProvider: React.FC<AuthProviderProps> = (props) => {
    const { busyElement, children } = props
    const [clients] = useState(() => createAuthClients(props))

    const loading = busyElement || <div className="cyton-loading">Loading...</div>

    if (clients) {
        console.log(`using clients`, clients)
        return (
            <KeycloakProvider LoadingComponent={loading} keycloak={clients.keycloak}>
                <UrqlClientProvider value={clients.urqlClient}>{children}</UrqlClientProvider>
            </KeycloakProvider>
        )
    }

    return <div>`Loading clients...`</div>
}
