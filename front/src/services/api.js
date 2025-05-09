export const API_BASE_URL = 'http://localhost:8000';

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
  },

  // Запрос на сброс пароля
  requestPasswordReset: async (email) => {
    const response = await fetch(`${API_BASE_URL}/request-password-reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return response.json();
  },

  // Сброс пароля
  resetPassword: async (token, newPassword) => {
    const response = await fetch(`${API_BASE_URL}/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, new_password: newPassword }),
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
  },
  uploadAudio: async (audioBlob, chatId, token) => {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.wav');
    formData.append('chat_id', chatId);
    const response = await fetch(`${API_BASE_URL}/api/upload-audio`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });
    return response.json();
  }
};
export const podcastService = {
    fetchRandomPodcast: async () => {
      const response = await fetch(`${API_BASE_URL}/api/random-podcast`);
      return response.json();
    },
    fetchWordInfo: async (word, token) => {
      const response = await fetch(`${API_BASE_URL}/word-info`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ word })
      });
      return response.json();
    }
};

export const testsService = {
    fetchGrammarTest: async (token, n = 5) => {
      const response = await fetch(`${API_BASE_URL}/api/tests/grammar?n=${n}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      return response.json();
    },
    fetchLevelTest: async (token) => {
      const response = await fetch(`${API_BASE_URL}/api/tests/level`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      return response.json();
    },
    submitLevelTest: async (answers, token) => {
      const response = await fetch(`${API_BASE_URL}/api/tests/level/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', "Authorization": `Bearer ${token}` },
        body: JSON.stringify(answers)
      });
      let data = await response.json();
      // Если сервер вернул строку, а не объект, попробуем распарсить
      if (typeof data === "string") {
        try {
          data = JSON.parse(data);
        } catch (e) {
          return { feedback: "Ошибка парсинга результата", raw: data };
        }
      }
      return data;
    },
    fetchVocabularyTest: async (token, n = 5) => {
      const response = await fetch(`${API_BASE_URL}/api/tests/vocabulary?n=${n}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      return response.json();
    },
    fetchWritingPrompt: async (token) => {
        const response = await fetch(`${API_BASE_URL}/api/tests/writing/prompt`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        return response.json();
      },
      evaluateWriting: async (userText, token) => {
        const response = await fetch(`${API_BASE_URL}/api/tests/writing/evaluate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', "Authorization": `Bearer ${token}` },
          body: JSON.stringify({ text: userText })
        });
        return response.json();
      },
    // ...другие методы для тестов
  };