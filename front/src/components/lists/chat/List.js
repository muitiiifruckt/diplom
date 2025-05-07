import React, { useEffect } from 'react';
import { useChat } from '../../../context/ChatContext';

function ChatList() {
  const { chats, activeChatId, setActiveChatId, fetchChats } = useChat();

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  return (
    <div className="chat-list">
      {chats.map(chat => (
        <div
          key={chat.id}
          className={`chat-list-item${activeChatId === chat.id ? ' active' : ''}`}
          onClick={() => setActiveChatId(chat.id)}
        >
          Чат {chat.id}
        </div>
      ))}
    </div>
  );
}

export default ChatList;