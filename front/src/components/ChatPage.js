import React, { useState } from 'react';
import ChatSidebar from './ChatSidebar';
import ChatWindow from './ChatWindow';
import AudioRecorder from './AudioRecorder';

const ChatPage = () => {
  const [selectedChatId, setSelectedChatId] = useState(null);

  const handleSelectChat = (chatId) => {
    setSelectedChatId(chatId);
    localStorage.setItem('chatId', chatId); // чтобы AudioRecorder мог брать
  };

  return (
    <div className="chat-page" style={{ display: 'flex' }}>
      <div style={{ width: '250px', borderRight: '1px solid #ccc' }}>
        <ChatSidebar onSelectChat={handleSelectChat} />
      </div>
      <div style={{ flexGrow: 1, padding: '16px' }}>
        <ChatWindow chatId={selectedChatId} />
        <AudioRecorder />
      </div>
    </div>
  );
};

export default ChatPage;
