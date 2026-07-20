import { useState } from "react";

export function LoginForm({ onJoin, error, onClearError }) {
  const [username, setUsername] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onJoin(username);
  };

  return (
    <div className="flex min-h-dvh items-center justify-center bg-gray-50 px-5">
      <div className="w-full max-w-xs sm:max-w-sm">
        <h1 className="mb-6 text-center text-xl font-light text-gray-800 sm:mb-8 sm:text-2xl">
          Group Chat
        </h1>
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div>
            <input
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                if (error) onClearError();
              }}
              placeholder="Enter your username"
              className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-[13px] text-gray-800 placeholder-gray-400 outline-none transition focus:border-gray-400 sm:px-4 sm:py-3 sm:text-sm"
              autoFocus
            />
          </div>
          {error && (
            <p className="text-center text-xs text-red-500 sm:text-sm">{error}</p>
          )}
          <button
            type="submit"
            className="w-full rounded-lg bg-gray-800 px-4 py-2.5 text-[13px] font-medium text-white transition hover:bg-gray-700 sm:py-3 sm:text-sm"
          >
            Join Chat
          </button>
          <p className="text-center text-[11px] text-gray-400 sm:text-xs">
            Letters and numbers only, at least 3 characters
          </p>
        </form>
      </div>
    </div>
  );
}
