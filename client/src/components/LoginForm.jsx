import { useState } from "react";

export function LoginForm({ onJoin, error, onClearError }) {
  const [username, setUsername] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onJoin(username);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <h1 className="mb-8 text-center text-2xl font-light text-gray-800">
          Group Chat
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                if (error) onClearError();
              }}
              placeholder="Enter your username"
              className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 placeholder-gray-400 outline-none transition focus:border-gray-400"
              autoFocus
            />
          </div>
          {error && (
            <p className="text-center text-sm text-red-500">{error}</p>
          )}
          <button
            type="submit"
            className="w-full rounded-lg bg-gray-800 px-4 py-3 text-sm font-medium text-white transition hover:bg-gray-700"
          >
            Join Chat
          </button>
          <p className="text-center text-xs text-gray-400">
            Letters and numbers only, at least 3 characters
          </p>
        </form>
      </div>
    </div>
  );
}
