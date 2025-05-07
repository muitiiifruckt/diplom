import React, { useState } from 'react';
import { chatService } from '../../../services/api';

const AnalysisModal = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleAnalyzeClick = async () => {
    const token = localStorage.getItem("token");
    setIsLoading(true);

    try {
      const data = await chatService.analyzeUserTranscripts(token);

      if (!data.error && !data.detail) {
        setAnalysisResult(data.analysis_result);
        setShowModal(true);
      } else {
        setAnalysisResult("Ошибка: " + (data.error || data.detail));
        setShowModal(true);
      }
    } catch (err) {
      console.error("Ошибка запроса на анализ:", err);
      setAnalysisResult("Ошибка соединения с сервером.");
      setShowModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <button onClick={handleAnalyzeClick} disabled={isLoading}>
        {isLoading ? "Анализирую..." : "Анализировать"}
      </button>

      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999
        }}>
          <div style={{
            backgroundColor: '#fff',
            padding: '20px',
            width: '80%',
            maxHeight: '80%',
            overflowY: 'auto',
            borderRadius: '10px',
            position: 'relative'
          }}>
            <button
              onClick={() => setShowModal(false)}
              style={{
                position: 'absolute',
                top: '10px',
                right: '15px',
                background: 'none',
                border: 'none',
                fontSize: '18px',
                cursor: 'pointer'
              }}
            >
              ✕
            </button>
            <h2>Результат анализа</h2>
            <pre style={{ whiteSpace: 'pre-wrap' }}>{analysisResult}</pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalysisModal;