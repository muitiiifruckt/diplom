import React, { useEffect, useState } from 'react';
import { chatService } from '../../../../services/api';

const ChatWindow = ({ chatId }) => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!chatId) return;

    const fetchMessages = async () => {
      const token = localStorage.getItem('token');
      const data = await chatService.fetchMessages(chatId, token);
      setMessages(data);
    };

    fetchMessages();
  }, [chatId]);

  return (
    <div className="chat-window">
      {chatId ? (
        <>
          {messages.map((msg) => (
            <div key={msg.id} className="message-pair">
              <div><strong>Вы:</strong> {msg.user_transcript}</div>
              <div><strong>Бот:</strong> {msg.bot_transcript}</div>
            </div>
          ))}
        </>
      ) : (
        <p>Выберите чат слева</p>
      )}
    </div>
  );
};

export default ChatWindow;