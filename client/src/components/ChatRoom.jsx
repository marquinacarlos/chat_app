import { useState, useRef, useEffect } from "react";

export function ChatRoom({ user, messages, onlineUsers, onSend, error, onClearError }) {
  const [text, setText] = useState("");
  const [showUsers, setShowUsers] = useState(false);
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
    <div className="flex h-dvh flex-col bg-gray-50">
      <header className="flex shrink-0 items-center justify-between border-b border-gray-200 bg-white px-3 py-2.5 sm:px-6 sm:py-3">
        <div className="min-w-0">
          <h1 className="text-base font-light text-gray-800 sm:text-lg">Group Chat</h1>
          <button
            type="button"
            onClick={() => setShowUsers((prev) => !prev)}
            className="text-[11px] text-gray-400 sm:text-xs"
          >
            {onlineUsers.length} online {showUsers ? "▲" : "▼"}
          </button>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-green-400 sm:h-2 sm:w-2" />
          <span className="text-xs text-gray-600 sm:text-sm">{user.username}</span>
        </div>
      </header>

      {showUsers && (
        <div className="shrink-0 border-b border-gray-200 bg-white px-3 py-2 sm:hidden">
          <ul className="flex flex-wrap gap-x-3 gap-y-1">
            {onlineUsers.map((name) => (
              <li key={name} className="flex items-center gap-1 text-xs text-gray-600">
                <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                {name}
                {name === user.username && (
                  <span className="text-[10px] text-gray-300">(you)</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <aside className="hidden w-44 shrink-0 border-r border-gray-200 bg-white p-3 sm:block lg:w-48 lg:p-4">
          <h2 className="mb-2 text-[10px] font-medium uppercase tracking-wider text-gray-400 sm:mb-3 sm:text-xs">
            Online
          </h2>
          <ul className="space-y-1.5 sm:space-y-2">
            {onlineUsers.map((name) => (
              <li key={name} className="flex items-center gap-1.5 text-xs text-gray-600 sm:gap-2 sm:text-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                <span className="truncate">{name}</span>
                {name === user.username && (
                  <span className="shrink-0 text-[10px] text-gray-300 sm:text-xs">(you)</span>
                )}
              </li>
            ))}
          </ul>
        </aside>

        <main className="flex min-w-0 flex-1 flex-col">
          <div className="flex-1 overflow-y-auto px-3 py-3 sm:px-6 sm:py-4">
            <div className="space-y-2 sm:space-y-3">
              {messages.map((msg) => {
                if (msg.type === "system") {
                  return (
                    <div key={msg.id} className="text-center text-[11px] text-gray-400 sm:text-xs">
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
                      className={`max-w-[75%] rounded-2xl px-3 py-1.5 sm:max-w-md sm:px-4 sm:py-2 ${
                        isOwn
                          ? "bg-gray-800 text-white"
                          : "border border-gray-200 bg-white text-gray-800"
                      }`}
                    >
                      {!isOwn && (
                        <p className="mb-0.5 text-[11px] font-medium text-gray-500 sm:text-xs">
                          {msg.username}
                        </p>
                      )}
                      <p className="break-words text-[13px] sm:text-sm">{msg.text}</p>
                      <p
                        className={`mt-0.5 text-right text-[9px] sm:mt-1 sm:text-[10px] ${
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
            <div className="shrink-0 px-3 sm:px-6">
              <p className="mb-1.5 text-center text-xs text-red-500 sm:mb-2 sm:text-sm">{error}</p>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="shrink-0 border-t border-gray-200 bg-white px-3 py-2 sm:px-6 sm:py-3"
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
                className="min-w-0 flex-1 rounded-full border border-gray-200 bg-gray-50 px-3 py-2 text-[13px] text-gray-800 placeholder-gray-400 outline-none transition focus:border-gray-400 sm:px-4 sm:text-sm"
                autoFocus
              />
              <button
                type="submit"
                className="shrink-0 rounded-full bg-gray-800 px-4 py-2 text-xs font-medium text-white transition hover:bg-gray-700 sm:px-5 sm:text-sm"
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
