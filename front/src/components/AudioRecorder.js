import { useState, useRef } from 'react';
import { encode } from 'wav-encoder';

async function convertToWav(audioBuffer) {
  const wavBuffer = await encode({
    sampleRate: audioBuffer.sampleRate,
    channelData: [
      audioBuffer.getChannelData(0) // Берём первый канал (моно)
    ]
  });
  return new Blob([wavBuffer], { type: 'audio/wav' });
}

const AudioRecorder = ({ onNewAudio }) => {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const sendAudioToServer = async (audioBlob, userAudioUrl) => {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.wav');

      const response = await fetch('http://localhost:8000/api/upload-audio', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      console.log('Аудио отправлено:', result);

      if (result.download_url) {
        const serverAudioUrl = `http://localhost:8000${result.download_url}`;
        onNewAudio(userAudioUrl, serverAudioUrl);
      }
    } catch (error) {
      console.error('Ошибка отправки:', error);
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
            type: mediaRecorderRef.current.mimeType
          });

          const arrayBuffer = await recordedBlob.arrayBuffer();
          const audioContext = new AudioContext();
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

          const wavBlob = await convertToWav(audioBuffer);
          const userAudioUrl = URL.createObjectURL(wavBlob);

          // Ждём отправки и добавляем оба сообщения
          await sendAudioToServer(wavBlob, userAudioUrl);
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
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  return (
    <div className="audio-recorder">
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
  );
};

export default AudioRecorder;