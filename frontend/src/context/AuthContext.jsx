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
                const profile = await userApi.get("/");
                setUser(profile.data);
                setIsLogged(true);
                return profile.data;
            } else {
                setUser(null);
                setIsLogged(false);
                return null;
            }
        } catch (error) {
            console.log("Error while checking login", error);
            setUser(null);
            setIsLogged(false);
            return null;
        }
    }, []);

    const clearAuth = useCallback(() => {
        setUser(null);
        setIsLogged(false);
    }, []);

    useEffect(() => {
        refreshAuth();
    }, [refreshAuth]);

    const isAdmin = user?.role === 'admin';

    return (
        <AuthContext.Provider value={
            {
                isLogged, user, isAdmin, refreshAuth, clearAuth
            }
        } >
          {children}  
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);