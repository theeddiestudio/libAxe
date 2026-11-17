import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { loginApi, userApi } from "../lib/axios.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [isLogged, setIsLogged] = useState(null);
    const [user, setUser] = useState(null);

    const refreshAuth = useCallback(async () => {
        try {
            const res = await loginApi.get("/");
            if (res.data.isLogged) {
                const user = await userApi.get("/");
                setUser(user.data);
                setIsLogged(true);
            } else {
                setUser(null);
                setIsLogged(false);
            }
        } catch (error) {
            console.log("Error while checking login", error);
            setUser(null);
            setIsLogged(false);
        }
    }, []);

    const clearAuth = useCallback(() => {
        setUser(null);
        setIsLogged(false);
    }, []);

    useEffect(() => {
        refreshAuth();
    }, [refreshAuth]);

    return (
        <AuthContext.Provider value={
            {
                isLogged, user, refreshAuth, clearAuth
            }
        } >
          {children}  
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);