import React from 'react'
import { useAuth } from './useAuth'

export type AuthRequiredProps = {
    role?: string
}

export const AuthRequired : React.FC<AuthRequiredProps> = props => {
    const {auth, login} = useAuth()
    if (auth.token) {
    // TODO FIXME enforce role check
        return <>{props.children}</>
    }
    // TODO FIXME parameterize login-required component
    return <button onClick={login}>Login required</button>
}
