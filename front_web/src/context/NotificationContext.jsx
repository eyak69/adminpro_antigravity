import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import config from '../config';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);


    // Initialize lastRead from localStorage
    const [lastRead, setLastRead] = useState(() => {
        return localStorage.getItem('notificationLastRead') || null;
    });

    const API_URL = config.API_BASE_URL;


    const fetchNotifications = async () => {
        try {
            const response = await axios.get(`${API_URL}/logs?limit=20`);
            const fetchedLogs = response.data;

            // Optimization: Only update state if JSON stringified is different (simple deep check)
            // This prevents re-renders when polling returns same data
            setNotifications(prev => {
                const isSame = JSON.stringify(prev) === JSON.stringify(fetchedLogs);
                return isSame ? prev : fetchedLogs;
            });

            // Calculate unread count
            const count = (!lastRead)
                ? fetchedLogs.length
                : fetchedLogs.filter(log => new Date(log.timestamp) > new Date(lastRead)).length;

            setUnreadCount(prev => prev === count ? prev : count);

        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        }
    };

    const addNotification = async (type, message) => {
        try {
            // Optimistic update
            const newLog = { type, message, timestamp: new Date().toISOString() };
            setNotifications(prev => [newLog, ...prev]);

            setUnreadCount(prev => prev + 1);

            // Persist to backend
            await axios.post(`${API_URL}/logs`, { type, message });

            // Re-fetch to sync
            fetchNotifications();
        } catch (error) {
            console.error('Failed to add notification:', error);
        }
    };

    const clearNotifications = () => {
        setUnreadCount(0);

        const now = new Date().toISOString();
        setLastRead(now);
        localStorage.setItem('notificationLastRead', now);
    };

    useEffect(() => {
        fetchNotifications();
        // Poll every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [lastRead]);

    // Memoize the context value to prevent consumers from re-rendering if state hasn't changed
    const contextValue = React.useMemo(() => ({
        notifications,
        unreadCount,
        addNotification,
        clearNotifications,
        fetchNotifications
    }), [notifications, unreadCount, lastRead]);

    return (
        <NotificationContext.Provider value={contextValue}>
            {children}
        </NotificationContext.Provider>
    );
};
