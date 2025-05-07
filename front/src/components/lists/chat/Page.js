import React, { useEffect } from 'react';
import { useChat } from '../../../context/ChatContext';
import Message from './Message';
import AudioRecorder from './AudioRecorder';

function ChatPage() {
  const { activeChatId, messages, fetchMessages } = useChat();

  useEffect(() => {
    if (activeChatId) fetchMessages(activeChatId);
  }, [activeChatId, fetchMessages]);

  if (!activeChatId) {
    return <div>Выберите чат</div>;
  }

  return (
    <div className="chat-main">
      <div className="messages">
        {messages.map(msg => (
          <Message key={msg.id} message={msg} />
        ))}
      </div>
      <AudioRecorder chatId={activeChatId} />
    </div>
  );
}

export default ChatPage;