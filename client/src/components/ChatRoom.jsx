import { useState, useRef, useEffect } from "react";

export function ChatRoom({ user, messages, onlineUsers, onSend, error, onClearError }) {
  const [text, setText] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText("");
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 sm:px-6">
        <div>
          <h1 className="text-lg font-light text-gray-800">Group Chat</h1>
          <p className="text-xs text-gray-400">
            {onlineUsers.length} online
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-green-400" />
          <span className="text-sm text-gray-600">{user.username}</span>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="hidden w-48 border-r border-gray-200 bg-white p-4 sm:block">
          <h2 className="mb-3 text-xs font-medium uppercase tracking-wider text-gray-400">
            Online
          </h2>
          <ul className="space-y-2">
            {onlineUsers.map((name) => (
              <li key={name} className="flex items-center gap-2 text-sm text-gray-600">
                <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                {name}
                {name === user.username && (
                  <span className="text-xs text-gray-300">(you)</span>
                )}
              </li>
            ))}
          </ul>
        </aside>

        <main className="flex flex-1 flex-col">
          <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
            <div className="space-y-3">
              {messages.map((msg) => {
                if (msg.type === "system") {
                  return (
                    <div key={msg.id} className="text-center text-xs text-gray-400">
                      {msg.text}
                    </div>
                  );
                }

                const isOwn = msg.username === user.username;
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-xs rounded-2xl px-4 py-2 sm:max-w-md ${
                        isOwn
                          ? "bg-gray-800 text-white"
                          : "bg-white text-gray-800 border border-gray-200"
                      }`}
                    >
                      {!isOwn && (
                        <p className="mb-0.5 text-xs font-medium text-gray-500">
                          {msg.username}
                        </p>
                      )}
                      <p className="text-sm break-words">{msg.text}</p>
                      <p
                        className={`mt-1 text-right text-[10px] ${
                          isOwn ? "text-gray-400" : "text-gray-300"
                        }`}
                      >
                        {formatTime(msg.timestamp)}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {error && (
            <div className="px-4 sm:px-6">
              <p className="mb-2 text-center text-sm text-red-500">{error}</p>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="border-t border-gray-200 bg-white px-4 py-3 sm:px-6"
          >
            <div className="flex gap-2">
              <input
                type="text"
                value={text}
                onChange={(e) => {
                  setText(e.target.value);
                  if (error) onClearError();
                }}
                placeholder="Type a message..."
                className="flex-1 rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-800 placeholder-gray-400 outline-none transition focus:border-gray-400"
                autoFocus
              />
              <button
                type="submit"
                className="rounded-full bg-gray-800 px-5 py-2 text-sm font-medium text-white transition hover:bg-gray-700"
              >
                Send
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
