export declare type LocalStorageState = {
    state: any;
    key: string;
    setState: (state: any) => void;
};
export declare const getLocalStorage: () => Storage | {
    setItem: (key: any, value: any) => void;
    getItem: (key: any) => any;
};
export declare const useLocalStorage: (key: string, initialState: any) => LocalStorageState;
//# sourceMappingURL=useLocalStorage.d.ts.map