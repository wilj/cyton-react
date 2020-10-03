export declare type User = {
    id: number;
    externalId: string;
    preferredUsername: string;
    jwt: any;
};
export declare type AuthInfo = {
    user?: User;
    token?: string;
};
export declare type AuthInfoState = {
    auth: AuthInfo;
    login: () => void;
    logout: () => void;
    hasRole: (role: string) => boolean;
};
export declare const useAuth: (overrides?: Partial<AuthInfo> | undefined) => AuthInfoState;
//# sourceMappingURL=useAuth.d.ts.map