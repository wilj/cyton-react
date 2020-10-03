import React from 'react';
import { useAuth } from './useAuth';
export var AuthRequired = function (props) {
    var _a = useAuth(), auth = _a.auth, login = _a.login;
    if (auth.token) {
        // TODO FIXME enforce role check
        return React.createElement(React.Fragment, null, props.children);
    }
    // TODO FIXME parameterize login-required component
    return React.createElement("button", { onClick: login }, "Login required");
};
