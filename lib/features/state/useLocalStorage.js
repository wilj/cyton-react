var ssrStorage = {};
export var getLocalStorage = function () {
    return typeof localStorage !== "undefined"
        ? localStorage
        : {
            setItem: function (key, value) {
                ssrStorage[key] = value;
            },
            getItem: function (key) {
                return ssrStorage[key];
            },
        };
};
export var useLocalStorage = function (key, initialState) {
    var stateString = getLocalStorage().getItem(key);
    var state = initialState;
    if (stateString) {
        state = JSON.parse(stateString);
    }
    else {
        getLocalStorage().setItem(key, JSON.stringify(initialState));
    }
    var setState = function (state) {
        return getLocalStorage().setItem(key, JSON.stringify(state));
    };
    return { state: state, key: key, setState: setState };
};
