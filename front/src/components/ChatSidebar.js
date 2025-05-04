import React, { useEffect, useState } from 'react';

const ChatSidebar = ({ onSelectChat }) => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true); // Добавляем загрузку
  const [error, setError] = useState(null); // Для ошибок

  useEffect(() => {
    const fetchChats = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Нет токена');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('http://localhost:8000/api/chats/', {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });

        if (!response.ok) {
          throw new Error('Ошибка при загрузке чатов');
        }

        const data = await response.json();
        if (Array.isArray(data)) {
          setChats(data);
        } else {
          console.error('Ожидался массив чатов, но пришло что-то другое:', data);
          setChats([]);
        }
      } catch (err) {
        console.error('Ошибка загрузки чатов:', err);
        setError('Не удалось загрузить чаты');
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, []);

  if (loading) {
    return <div>Загрузка чатов...</div>;
  }

  if (error) {
    return <div>Ошибка: {error}</div>;
  }

  return (
    <div className="chat-sidebar">
      <h3>Ваши чаты</h3>
      {chats.length === 0 ? (
        <div>Чатов нет</div>
      ) : (
        chats.map((chat) => (
          <div
            key={chat.chat_id}
            className="chat-item"
            onClick={() => onSelectChat(chat.chat_id)}
          >
            Чат #{chat.chat_id}
          </div>
        ))
      )}
    </div>
  );
};

export default ChatSidebar;
