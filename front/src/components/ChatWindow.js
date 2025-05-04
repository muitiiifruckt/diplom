import React, { useEffect, useState } from 'react';

const ChatWindow = ({ chatId }) => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!chatId) return;

    const fetchMessages = async () => {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/chats/${chatId}/messages/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      const data = await response.json();
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
