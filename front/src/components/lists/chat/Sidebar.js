import React from 'react';
import { useChat } from '../../../context/ChatContext';

function Sidebar() {
  const { createChat } = useChat();

  const handleCreateChat = async () => {
    await createChat();
  };

  return (
    <aside className="sidebar">
      <button onClick={handleCreateChat}>+ Новый чат</button>
      {/* Здесь может быть <ChatList /> */}
    </aside>
  );
}

export default Sidebar;