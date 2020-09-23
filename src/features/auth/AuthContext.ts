import React, { useState } from 'react'
import { AuthInfo } from './useAuth'

export const AuthContext = React.createContext({} as AuthInfo)
export type AuthApi = {
    login: () => void
    logout: () => void
}
export const AuthApiContext = React.createContext({} as AuthApi)