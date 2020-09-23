import React, { useState, useCallback, useMemo } from 'react'
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

export type AuthProviderProps = {
    baseDomain: string
    realm: string
    busyElement?: JSX.Element
}


export const AuthProvider: React.FC<AuthProviderProps> = ({
    baseDomain,
    realm,
    busyElement,
    children,
}) => {
    const [auth, setAuth] = useState({} as AuthInfo)  

    const authImpl = useMemo(() => {
        const clientId = realm
        const authUrl = `https://auth.${baseDomain}/auth`
        
        // TODO FIXME urls need to be props
        const baseGraphqlUrl = `://admin.${baseDomain}/graphql`
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

        const handleKeycloakEvent: KeycloakEventHandler = (event, error) => {
            if (auth.token !== keycloak.token) {
                setAuth({...auth, token: keycloak.token})
            }
        }
        
        return {keycloak, handleKeycloakEvent, urqlClient}
        
    }, [])
    const login = useCallback(() => authImpl.keycloak.login({ scope: 'profile' }), [])
    const logout = useCallback(() => {
                        setAuth(state => ({} as AuthInfo))
                        authImpl.keycloak.logout()
                    }, [])
    
    const authApi = useMemo(() => ({login, logout, setUser: (user: User) => setAuth({...auth, user } as AuthInfo)}), [])
    return (
        <KeycloakProvider
            onEvent={authImpl.handleKeycloakEvent}
            LoadingComponent={busyElement || <div className="cyton-loading">Loading...</div>  }
            keycloak={authImpl.keycloak}
        >
            <UrqlClientProvider value={authImpl.urqlClient}>
                <AuthContext.Provider value={auth}>
                    <AuthApiContext.Provider value={authApi}>
                        {children}
                    </AuthApiContext.Provider>
                </AuthContext.Provider>
            </UrqlClientProvider>
        </KeycloakProvider>
    )
}
