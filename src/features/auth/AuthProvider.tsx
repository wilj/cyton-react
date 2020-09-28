import React, { useState, useCallback, useMemo, useEffect } from 'react'
import { KeycloakProvider, KeycloakEventHandler } from '@react-keycloak/web'
import Keycloak from 'keycloak-js'
import {
    createClient,
    debugExchange,
    fetchExchange,
    Provider as UrqlClientProvider,
    subscriptionExchange,
    useMutation,
} from 'urql'
import { SubscriptionClient } from 'subscriptions-transport-ws'
import { AuthInfo, User } from './useAuth'
import { AuthContext, AuthApiContext } from './AuthContext'

export interface AuthClients {
    keycloak: any
    urqlClient: any
    subscriptionClient: any
}
export function createAuthClients(baseDomain: string, realm: string, apiDomain?: string) : AuthClients {
    const clientId = realm
    const authUrl = `https://auth.${baseDomain}/auth`
    
    // TODO FIXME urls need to be props
    const baseGraphqlUrl = apiDomain ? (apiDomain + `/graphql`) : `://admin.${baseDomain}/graphql`
    const subscriptionClient = new SubscriptionClient(`wss${baseGraphqlUrl}`, {})
    
    const keycloak = Keycloak({  url: authUrl, realm, clientId })
    
    const urqlClient = createClient({
        url: `https${baseGraphqlUrl}`,
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
                forwardSubscription: operation =>
                    subscriptionClient.request(operation),
            }),
        ],
    })
    
    return {keycloak, urqlClient, subscriptionClient}    
}


export type AuthProviderProps = {
    baseDomain: string
    realm: string
    apiDomain?: string
    busyElement?: JSX.Element
}

export const AuthProvider: React.FC<AuthProviderProps> = ({
    baseDomain,
    realm,
    apiDomain,
    busyElement,
    children,
}) => {
    const [auth, setAuth] = useState({} as AuthInfo)  
    const clients = useMemo(() => createAuthClients(baseDomain, realm, apiDomain), [baseDomain, realm, apiDomain])
    const login = useCallback(() => clients.keycloak.login({ scope: 'profile' }), [])
    const logout = useCallback(() => {
                        setAuth(state => ({} as AuthInfo))
                        clients.keycloak.logout()
                    }, [])
    
    const authApi = useMemo(() => ({login, logout, setUser: (user: User) => setAuth({...auth, user } as AuthInfo)}), [])
    const loading = busyElement || <div className="cyton-loading">Loading...</div> 
    const handleKeycloakEvent: KeycloakEventHandler = (event, error) => {
        if (auth.token !== clients.keycloak.token) {
            setAuth({...auth, token: clients.keycloak.token})
        }
    }
    
    console.log(`using clients`, clients)
    return (
        <KeycloakProvider
            onEvent={handleKeycloakEvent}
            LoadingComponent={ loading }
            keycloak={clients.keycloak}
        >
            <UrqlClientProvider value={clients.urqlClient}>
                <AuthContext.Provider value={auth}>
                    <AuthApiContext.Provider value={authApi}>
                        {children}
                    </AuthApiContext.Provider>
                </AuthContext.Provider>
            </UrqlClientProvider>
        </KeycloakProvider>
    )
}
