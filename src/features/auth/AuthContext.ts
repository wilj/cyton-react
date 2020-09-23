import React, { useState } from 'react'
import { User, AuthInfo } from './useAuth'

export const AuthContext = React.createContext({} as AuthInfo)
export type AuthApi = {
    login: () => void
    logout: () => void
    setUser: (user: User) => void
}
export const AuthApiContext = React.createContext({} as AuthApi)