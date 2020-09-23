const ssrStorage: any = {}

export type LocalStorageState = {
    state: any
    key: string
    setState: (state: any) => void
}

export const getLocalStorage = () =>
    typeof localStorage !== `undefined`
        ? localStorage
        : {
              setItem: (key: any, value: any) => {
                  ssrStorage[key] = value
              },
              getItem: (key: any) => {
                  return ssrStorage[key]
              },
          }

export const useLocalStorage = (
    key: string,
    initialState: any
): LocalStorageState => {
    let stateString = getLocalStorage().getItem(key)
    let state = initialState
    if (stateString) {
        state = JSON.parse(stateString)
    } else {
        getLocalStorage().setItem(key, JSON.stringify(initialState))
    }

    const setState = (state: any) =>
        getLocalStorage().setItem(key, JSON.stringify(state))

    return { state, key, setState }
}
