import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext({ socket: null, connected: false });

// Must be rendered INSIDE <AuthProvider>
export function SocketProvider({ children }) {
  const { user, logout } = useAuth();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  // Depend on user.id, not user: updateUser() creates a new object and
  // would otherwise disconnect/reconnect the socket on every profile edit.
  const userId = user?.id;

  useEffect(() => {
    if (!userId) return;

    const s = io(import.meta.env.VITE_API_URL, {
      // Function form: the token is read fresh on every (re)connect
      auth: (cb) => cb({ token: localStorage.getItem('token') }),
    });

    s.on('connect', () => setConnected(true));
    s.on('disconnect', () => setConnected(false));
    s.on('connect_error', (err) => {
      // Server auth middleware should call next(new Error('unauthorized'))
      if (err.message === 'unauthorized') logout();
    });

    setSocket(s);

    return () => {
      s.removeAllListeners();
      s.disconnect();
      setSocket(null);
      setConnected(false);
    };
  }, [userId, logout]);

  const value = useMemo(() => ({ socket, connected }), [socket, connected]);

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
}

// socket is null while logged out or before the connection object exists
export function useSocket() {
  return useContext(SocketContext);
}

/*
  Usage inside a component (e.g. the chat page):

  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;
    const onNew = (msg) => { ... };
    socket.on('message:new', onNew);
    return () => socket.off('message:new', onNew);
  }, [socket]);
*/
