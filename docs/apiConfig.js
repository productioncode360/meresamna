// docs/apiConfig.js
export const API_BASE = "http://localhost:5005/api/auth";

export const MODULES = {
    MANUAL: {
        id: "v34x",
        endpoints: {
            reg: `${API_BASE}/register_v34x`,
            login: `${API_BASE}/login_v34x`,
            logout: `${API_BASE}/logout_v34x`
        }
    },
    GOOGLE: {
        id: "ty58d",
        endpoints: {
            login: `${API_BASE}/google-login_ty58d`,
            logout: `${API_BASE}/logout_ty58d`
        }
    }
};