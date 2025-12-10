import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { googleLogout, useGoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";
import Swal from 'sweetalert2';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [authEnabled, setAuthEnabled] = useState(false);

    // Backend URL - assume relative or configured in Vite
    // Adjust based on your setup. Usually localhost:3000/api
    const API_URL = 'http://localhost:3000/api';

    useEffect(() => {
        checkAuthStatus();
    }, []);

    const checkAuthStatus = async () => {
        try {
            const { data } = await axios.get(`${API_URL}/auth/status`);
            setAuthEnabled(data.enabled);

            if (!data.enabled) {
                // Security disabled, allow access
                setIsAuthenticated(true);
                setUser({ name: 'System User', role: 'admin' });
            } else {
                // Security enabled, check for valid token
                if (token) {
                    try {
                        const decoded = jwtDecode(token);
                        // Optional: Check expiration
                        if (decoded.exp * 1000 < Date.now()) {
                            logout();
                        } else {
                            setUser(decoded);
                            setIsAuthenticated(true);
                            // Set default axios header
                            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                        }
                    } catch (e) {
                        logout();
                    }
                } else {
                    setIsAuthenticated(false);
                }
            }
        } catch (error) {
            console.error("Error checking auth status:", error);
            // If we can't connect to backend, we assume security is disabled to avoid lockout 
            // specifically for this user situation. Ideally in prod it should be secure.
            setAuthEnabled(false);
            setIsAuthenticated(true);
            setUser({ name: 'System User (Offline)', role: 'admin' });
        } finally {
            setIsLoading(false);
        }
    };

    const loginWithGoogle = async (googleToken) => {
        try {
            const { data } = await axios.post(`${API_URL}/auth/google`, { token: googleToken });
            const { user, token: newToken } = data;

            setToken(newToken);
            localStorage.setItem('token', newToken);
            setUser(user);
            setIsAuthenticated(true);
            axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

            Swal.fire({
                icon: 'success',
                title: 'Bienvenido',
                text: `Hola ${user.name}!`,
                timer: 1500,
                showConfirmButton: false
            });

            return true;
        } catch (error) {
            console.error("Login Error:", error);
            Swal.fire({
                icon: 'error',
                title: 'Error de autenticación',
                text: 'No se pudo iniciar sesión con Google.'
            });
            return false;
        }
    };

    const logout = () => {
        googleLogout();
        setToken(null);
        localStorage.removeItem('token');
        setUser(null);
        setIsAuthenticated(false);
        delete axios.defaults.headers.common['Authorization'];
    };

    const value = {
        user,
        token,
        isAuthenticated,
        isLoading,
        authEnabled,
        loginWithGoogle,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {!isLoading && children}
        </AuthContext.Provider>
    );
};
