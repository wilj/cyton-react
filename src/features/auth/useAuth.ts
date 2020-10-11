import { useKeycloak } from '@react-keycloak/web'
import { useEffect, useCallback } from 'react'
import * as Urql from 'urql';
import gql from 'graphql-tag';

export type User = {
    id: number
    externalId: string
    preferredUsername: string,
    jwt: any
}

export type AuthInfo = {
    user?: User
    token?: string
}

export type AuthInfoState = {
    auth: AuthInfo
    login: () => void
    logout: () => void
    hasRole: (role: string) => boolean
}

export const useAuth = (overrides?: Partial<AuthInfo>): AuthInfoState => {    
    const [registerResponse, register] = Urql.useMutation(gql`
        mutation RegisterUser($input: RegisterUserInput!) {
            registerUser(input: $input) {
                userSessions {
                id
                externalId
                preferredUsername
                jwt
                }
            }
        }
    `)

    const userSessions = registerResponse.data?.registerUser
        ?.userSessions as any
    const user = userSessions && (userSessions[0] as User)
    
    const {keycloak} = useKeycloak()
    
    const login = useCallback(() => {
        if (keycloak) {
            keycloak.login({ scope: 'profile' })
        }
    }, [keycloak])

    const logout = useCallback(() => {
        if (keycloak) {
            keycloak.logout()
        }
    }, [keycloak])


    useEffect(() => {
        register({ input: {} })
        return () => {}
    }, [keycloak?.token])

   
    const hasRole = (role: string) =>
        (user && user.jwt.realm_access.roles.indexOf(role) !== -1) ||
        false

    return {auth: {user, token: keycloak?.token}, login, logout, hasRole }
}










