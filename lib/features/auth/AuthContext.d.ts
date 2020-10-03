import React from 'react';
import { User, AuthInfo } from './useAuth';
export declare const AuthContext: React.Context<AuthInfo>;
export declare type AuthApi = {
    login: () => void;
    logout: () => void;
    setUser: (user: User) => void;
};
export declare const AuthApiContext: React.Context<AuthApi>;
//# sourceMappingURL=AuthContext.d.ts.map