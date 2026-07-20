import { useState, useRef, useCallback, useEffect } from "react";

const WS_URL =
  import.meta.env.VITE_WS_URL ||
  `${window.location.protocol === "https:" ? "wss:" : "ws:"}//${window.location.host}/ws`;

export function useChat() {
  const [state, setState] = useState({
    connected: false,
    user: null,
    messages: [],
    onlineUsers: [],
    error: null,
  });

  const wsRef = useRef(null);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  const connect = useCallback((username) => {
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: "join", username }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case "joined":
          setState((prev) => ({
            ...prev,
            connected: true,
            user: { id: data.userId, username: data.username },
            onlineUsers: data.onlineUsers,
            messages: data.history || [],
            error: null,
          }));
          break;

        case "message":
          setState((prev) => ({
            ...prev,
            messages: [...prev.messages, data],
          }));
          break;

        case "user_joined":
          setState((prev) => ({
            ...prev,
            onlineUsers: data.onlineUsers,
            messages: [
              ...prev.messages,
              {
                id: crypto.randomUUID(),
                type: "system",
                text: `${data.username} joined the chat`,
                timestamp: new Date().toISOString(),
              },
            ],
          }));
          break;

        case "user_left":
          setState((prev) => ({
            ...prev,
            onlineUsers: data.onlineUsers,
            messages: [
              ...prev.messages,
              {
                id: crypto.randomUUID(),
                type: "system",
                text: `${data.username} left the chat`,
                timestamp: new Date().toISOString(),
              },
            ],
          }));
          break;

        case "error":
          setState((prev) => ({ ...prev, error: data.error }));
          break;
      }
    };

    ws.onclose = () => {
      setState((prev) => ({ ...prev, connected: false, user: null }));
      wsRef.current = null;
    };
  }, []);

  const sendMessage = useCallback((text) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "message", text }));
    }
  }, []);

  useEffect(() => {
    return () => {
      wsRef.current?.close();
    };
  }, []);

  return { ...state, connect, sendMessage, clearError };
}
