import { io } from 'socket.io-client';
import { API_URL } from '../services/api';

const socketUrl = API_URL.replace(/\/api\/?$/, '');

export const initSocket = () => {
    if (!window.socket) {
        window.socket = io(socketUrl, {
            withCredentials: true,
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
        });

        window.socket.on('connect', () => {
            console.log('Socket connected:', window.socket.id);
        });

        window.socket.on('disconnect', (reason) => {
            console.log('Socket disconnected:', reason);
        });

        window.socket.on('error', (err) => {
            console.error('Socket error:', err);
        });
    }
    return window.socket;
};

export const getSocket = () => window.socket;
