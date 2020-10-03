import React from 'react';
export interface AuthClients {
    keycloak: any;
    urqlClient: any;
    subscriptionClient: any;
}
export declare function createAuthClients(baseDomain: string, realm: string, clientId: string, apiDomain?: string): AuthClients;
export declare type AuthProviderProps = {
    baseDomain: string;
    realm: string;
    clientId: string;
    apiDomain?: string;
    busyElement?: JSX.Element;
};
export declare const AuthProvider: React.FC<AuthProviderProps>;
//# sourceMappingURL=AuthProvider.d.ts.map