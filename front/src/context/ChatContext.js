import { createContext, useContext, useState, useRef } from 'react';
import { chatService } from '../services/api';

const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const messageIdRef = useRef(0);

  const fetchChats = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    const data = await chatService.fetchChats(token);
    setChats(data);
  };

  const fetchMessages = async (chatId) => {
    const token = localStorage.getItem("token");
    const data = await chatService.fetchMessages(chatId, token);
    setMessages(data);
  };

  const createChat = async () => {
    const token = localStorage.getItem("token");
    const data = await chatService.createChat(token);
    await fetchChats();
    return data;
  };

  return (
    <ChatContext.Provider value={{
      chats,
      messages,
      activeChatId,
      setActiveChatId,
      fetchChats,
      fetchMessages,
      createChat,
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);