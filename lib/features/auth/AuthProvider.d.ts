import React from 'react';
export interface AuthClients {
    keycloak: any;
    urqlClient: any;
    subscriptionClient: any;
}
export declare type AuthProviderProps = {
    authDomain: string;
    realm: string;
    clientId: string;
    apiDomain: string;
    busyElement?: JSX.Element;
    cacheEnabled?: boolean;
};
export declare function createAuthClients(props: AuthProviderProps): AuthClients;
export declare const AuthProvider: React.FC<AuthProviderProps>;
//# sourceMappingURL=AuthProvider.d.ts.map