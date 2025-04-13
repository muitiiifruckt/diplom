import { useState } from 'react';
import './App.css';
import AudioRecorder from './components/AudioRecorder';
import Message from './components/Message';

function App() {
  const [messages, setMessages] = useState([]);

  const handleNewAudio = (userAudioUrl, serverAudioUrl) => {
    const timestamp = new Date().toLocaleTimeString();
  
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        id: Date.now(),
        type: 'audio',
        content: userAudioUrl,
        sender: 'user',
        timestamp: timestamp,
      },
      {
        id: Date.now() + 1,
        type: 'audio',
        content: serverAudioUrl,
        sender: 'bot',
        timestamp: timestamp,
      }
    ]);
  };
  

  return (
    <div className="chat-app">
      <div className="chat-header">
        <h1>Голосовой чат</h1>
      </div>
      
      <div className="chat-messages">
        {messages.map((message) => (
          <Message key={message.id} message={message} />
        ))}
      </div>
      
      <div className="chat-input">
        <AudioRecorder onNewAudio={handleNewAudio} />
      </div>
    </div>
  );
}

export default App;