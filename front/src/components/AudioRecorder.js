import React, { useState, useRef } from 'react';
import { encode } from 'wav-encoder';

const convertToWav = async (audioBuffer) => {
  const wavBuffer = await encode({
    sampleRate: audioBuffer.sampleRate,
    channelData: [audioBuffer.getChannelData(0)]
  });
  return new Blob([wavBuffer], { type: 'audio/wav' });
};

const AudioRecorder = ({ onNewAudio, onNewTextMessage }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [textInput, setTextInput] = useState('');
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const sendAudioToServer = async (audioBlob) => {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.wav');
      formData.append('chat_id', localStorage.getItem('chatId'));
  
      const token = localStorage.getItem('token');
  
      const response = await fetch('http://localhost:8000/api/upload-audio', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      });
  
      const result = await response.json();
  
      const serverAudioUrl = `http://localhost:8000${result.download_url}`;
      const userTranscript = result.user_transcript;
      const modelTranscript = result.model_transcript;
  
      return { serverAudioUrl, userTranscript, modelTranscript };
    } catch (error) {
      console.error('Ошибка отправки аудио:', error);
      return null;
    }
  };

  const sendTextToServer = async (text) => {
    try {
      const formData = new FormData();
      formData.append('message', text);
      formData.append('chat_id', localStorage.getItem('chatId'));
  
      const token = localStorage.getItem('token');
  
      const response = await fetch('http://localhost:8000/api/get_answer', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      });
  
      const result = await response.json();
  
      return {
        user_message: result.user_message,
        model_message: result.model_message,
      };
    } catch (error) {
      console.error('Ошибка отправки текста:', error);
      return null;
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        try {
          const recordedBlob = new Blob(audioChunksRef.current, {
            type: mediaRecorderRef.current.mimeType,
          });
      
          const arrayBuffer = await recordedBlob.arrayBuffer();
          const audioContext = new AudioContext();
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
          const wavBlob = await convertToWav(audioBuffer);
          const userAudioUrl = URL.createObjectURL(wavBlob);
      
          const serverAudioUrlPromise = sendAudioToServer(wavBlob);
          onNewAudio(userAudioUrl, serverAudioUrlPromise);  
      
        } catch (error) {
          console.error('Ошибка обработки аудио:', error);
        } finally {
          audioChunksRef.current = [];
        }
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Ошибка доступа к микрофону:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
    }
  };

  const handleTextSubmit = async (e) => {
    e.preventDefault();
    if (!textInput.trim()) return;

    const textPromise = sendTextToServer(textInput);
    textPromise._text = textInput; // сохраняем исходный текст
    onNewTextMessage(textPromise);

    setTextInput('');
  };

  return (
    <div className="audio-recorder">
      <div style={{ marginBottom: '10px' }}>
        {isRecording ? (
          <button className="stop-button" onClick={stopRecording}>
            Остановить запись
          </button>
        ) : (
          <button className="start-button" onClick={startRecording}>
            Записать голосовое сообщение
          </button>
        )}
      </div>

      <form onSubmit={handleTextSubmit} style={{ display: 'flex', gap: '8px' }}>
        <input
          type="text"
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          placeholder="Введите сообщение..."
          className="text-input"
        />
        <button type="submit" className="send-button">
          Отправить
        </button>
      </form>
    </div>
  );
};

export default AudioRecorder;
