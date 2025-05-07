const API_BASE_URL = 'http://localhost:8000';

export const authService = {
  login: async (username, password) => {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);
    const response = await fetch(`${API_BASE_URL}/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString(),
    });
    return response.json();
  },
  register: async (username, password) => {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    return response.json();
  }
};

export const chatService = {
  fetchChats: async (token) => {
    const response = await fetch(`${API_BASE_URL}/api/my-chats`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    return response.json();
  },
  fetchMessages: async (chatId, token) => {
    const response = await fetch(`${API_BASE_URL}/api/chat/${chatId}/messages`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    return response.json();
  },
  createChat: async (token) => {
    const response = await fetch(`${API_BASE_URL}/api/create-chat`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${token}` },
    });
    return response.json();
  },
  sendText: async (text, chatId, token) => {
    const formData = new FormData();
    formData.append('message', text);
    formData.append('chat_id', chatId);
    const response = await fetch(`${API_BASE_URL}/api/get_answer`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });
    return response.json();
  },
  analyzeUserTranscripts: async (token) => {
    const response = await fetch(`${API_BASE_URL}/api/analyze-user-transcripts`, {
      method: "GET",
      headers: { "Authorization": `Bearer ${token}` }
    });
    return response.json();
  }
};