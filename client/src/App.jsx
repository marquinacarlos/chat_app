import { useChat } from "./hooks/useChat";
import { LoginForm } from "./components/LoginForm";
import { ChatRoom } from "./components/ChatRoom";

function App() {
  const { connected, user, messages, onlineUsers, error, connect, sendMessage, clearError } =
    useChat();

  if (!connected || !user) {
    return <LoginForm onJoin={connect} error={error} onClearError={clearError} />;
  }

  return (
    <ChatRoom
      user={user}
      messages={messages}
      onlineUsers={onlineUsers}
      onSend={sendMessage}
      error={error}
      onClearError={clearError}
    />
  );
}

export default App;
