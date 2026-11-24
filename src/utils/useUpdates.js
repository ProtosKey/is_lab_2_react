import { useEffect, useRef } from 'react';
import { getApiUrl } from '../controllers/api';

const getWsUrl = () => {
    const base = getApiUrl().replace(/\/api\/?$/, '');
    if (/^https?:\/\//i.test(base)) {
        return `${base.replace(/^http/i, 'ws')}/ws/updates`;
    }
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const path = base.startsWith('/') ? base : `/${base}`;
    return `${protocol}//${window.location.host}${path}/ws/updates`;
};

const useUpdates = (topics, onUpdate) => {
    const topicsRef = useRef(topics);
    const callbackRef = useRef(onUpdate);
    topicsRef.current = topics;
    callbackRef.current = onUpdate;

    useEffect(() => {
        let active = true;
        let socket = null;
        let reconnectTimer = null;
        let debounceTimer = null;

        const connect = () => {
            if (!active) {
                return;
            }
            socket = new WebSocket(getWsUrl());

            socket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (!topicsRef.current.includes(data?.topic)) {
                        return;
                    }
                    clearTimeout(debounceTimer);
                    debounceTimer = setTimeout(() => {
                        if (active) {
                            callbackRef.current?.();
                        }
                    }, 200);
                } catch {
                    // ignore malformed frames
                }
            };

            socket.onclose = () => {
                if (active) {
                    reconnectTimer = setTimeout(connect, 3000);
                }
            };
        };

        connect();

        return () => {
            active = false;
            clearTimeout(reconnectTimer);
            clearTimeout(debounceTimer);
            if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
                socket.close();
            }
        };
    }, []);
};

export default useUpdates;
