import { useKeycloak } from '@react-keycloak/web'
import { useEffect, useContext } from 'react'
import * as Urql from 'urql';
import gql from 'graphql-tag';
import { getLocalStorage } from '../state/useLocalStorage';
import { AuthContext, AuthApiContext } from './AuthContext';

const storageKey = `auth`

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

const saveState = (state: AuthInfo) => {
    getLocalStorage().setItem(storageKey, JSON.stringify(state))
}
    
const loadState = () => {
    const state = JSON.parse(getLocalStorage().getItem(storageKey) || JSON.stringify({})) as AuthInfo
    return state
}




export const useAuth = (overrides?: Partial<AuthInfo>): AuthInfoState => {
    const [keycloak] = useKeycloak()
    const auth = useContext(AuthContext)
    const api = useContext(AuthApiContext)

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

    
    useEffect(() => {
        api.setUser(user)
        return () => {}
    }, [user])

    useEffect(() => {
        if (auth.token) {
            register({ input: {} })
        }
        return () => {}
    }, [auth.token])

   
    const hasRole = (role: string) =>
        (auth.user && auth.user.jwt.realm_access.roles.indexOf(role) !== -1) ||
        false

    return { auth, ...api, hasRole }
}










