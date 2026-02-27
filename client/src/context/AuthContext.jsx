import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, saveToken, getToken, clearToken } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const token = getToken();
            if (!token) {
                setIsLoading(false);
                return;
            }
            // Simple validation check against health endpoint which returns status with auth headers if they were protected,
            // but for hackathon demo we just restore from localStorage user payload if token exists
            try {
                const storedUser = localStorage.getItem('user');
                if (storedUser) {
                    setUser(JSON.parse(storedUser));
                }
            } catch (e) {
                clearToken();
            }
            setIsLoading(false);
        };
        checkAuth();
    }, []);

    const login = async (username, password) => {
        setIsLoading(true);
        const { data, error } = await api.login(username, password);
        setIsLoading(false);
        if (error || !data) {
            return { error: error || "Invalid credentials" };
        }

        saveToken(data.token);
        const userObj = { id: data.id, name: data.name, role: data.role };
        setUser(userObj);
        localStorage.setItem('user', JSON.stringify(userObj));
        return { user: userObj };
    };

    const logout = () => {
        clearToken();
        localStorage.removeItem('user');
        setUser(null);
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
