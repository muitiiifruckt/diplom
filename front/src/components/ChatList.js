// components/ChatList.js
import React, { useState, useEffect } from 'react';
import './ChatList.css';

const ChatList = ({ onSelectChat }) => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchChats = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await fetch('http://localhost:8000/api/get-chats', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (response.ok) {
          setChats(data.chats);
        } else {
          setError(data.detail || 'Неизвестная ошибка');
        }
      } catch (error) {
        setError('Ошибка при получении чатов');
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return <p>Загрузка чатов...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className="chat-list">
      <h3>Чаты</h3>
      {chats.length === 0 ? (
        <p>Нет чатов</p>
      ) : (
        <ul className="chat-list-items">
          {chats.map((chat) => (
            <li
              key={chat.id}
              className="chat-list-item"
              onClick={() => onSelectChat(chat.id)} // Передаем ID чата
            >
              <div className="chat-item-info">
                <span className="chat-item-name">{chat.name}</span>
                <span className="chat-item-date">
                  Создан: {formatDate(chat.created_at)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ChatList;
