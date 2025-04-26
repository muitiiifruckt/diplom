import { useState, useEffect } from 'react';
import WordHighlighter from "./WordHighlighter";

function WordGuessPage({ onReturnToChat }) {
  const [word, setWord] = useState('');
  const [userTranslation, setUserTranslation] = useState('');
  const [result, setResult] = useState(null);
  const [examples, setExamples] = useState([]);
  const [showExamples, setShowExamples] = useState(false);
  const [loadingExamples, setLoadingExamples] = useState(false);
  const [selectedWord, setSelectedWord] = useState(null);
  const [wordInfo, setWordInfo] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState(null);
  const [loadingImage, setLoadingImage] = useState(false);
  

  const handleGenerateImage = () => {
    setLoadingImage(true);
    fetch('http://localhost:8000/gen_imege', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ word })
    })
      .then(res => res.json())
      .then(data => {
        setGeneratedImageUrl(`http://localhost:8000${data.download_url}?t=${Date.now()}`);
        setLoadingImage(false);
      })
      .catch(err => {
        console.error('Ошибка при генерации изображения:', err);
        setLoadingImage(false);
      });
  };
  
  const fetchWord = () => {
    setGeneratedImageUrl(null);
  
    setTimeout(() => {
      fetch('http://localhost:8000/get-random-word', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })
        .then(res => res.json())
        .then(data => {
          setWord(data.word);
          setUserTranslation('');
          setResult(null);
          setExamples([]);
          setShowExamples(false);
        })
        .catch(err => console.error('Ошибка при получении слова:', err));
    }, 50);
  };
  
  

  const handleSubmit = () => {
    fetch('http://localhost:8000/check-translation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        word: word,
        user_translation: userTranslation
      })
    })
      .then(res => res.json())
      .then(data => {
        setResult(data.correct ? 'Верно!' : `Неверно. Правильный перевод: ${data.correct_translation}`);
      })
      .catch(err => console.error('Ошибка при проверке перевода:', err));
  };

  const fetchExamples = () => {
    setLoadingExamples(true);
    fetch('http://localhost:8000/word-info', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ word:word })
    })
      .then(res => res.json())
      .then(data => {
        setExamples(data.examples.split('\n').filter(Boolean)); // Разделение по строкам
        setShowExamples(true);
        setLoadingExamples(false);
      })
      .catch(err => {
        console.error('Ошибка при получении примеров:', err);
        setLoadingExamples(false);
      });
  };

  const handleWordClick = (word) => {
    setSelectedWord(word);
    // Убираем автоматическое открытие модального окна до получения ответа от сервера
    fetch('http://localhost:8000/word-info', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ word })
    })
      .then(res => res.json())
      .then(data => {
        setWordInfo(data); // Сохраняем информацию о слове
        setShowModal(true); // Открываем модальное окно только после успешного ответа
      })
      .catch(err => console.error('Ошибка при получении информации о слове:', err));
  };
  
  
  useEffect(() => {
    fetchWord();
  }, []); // Тут ок — без fetchWord в deps, просто []
  

  return (
    
    <div className="word-guess-page">
      <h2>Угадай перевод</h2>

      <div className="word-section">
        <p><strong>Слово:</strong> {word}</p>
      </div>

      <input
        type="text"
        placeholder="Введите перевод"
        value={userTranslation}
        onChange={(e) => setUserTranslation(e.target.value)}
      />
      <button onClick={handleSubmit}>Проверить</button>
      <button onClick={fetchWord}>Следующее слово</button>
      <button onClick={fetchExamples} disabled={loadingExamples}>
        {loadingExamples ? 'Загрузка...' : 'Показать примеры'}
      </button>
      <button onClick={handleGenerateImage} disabled={loadingImage}>
      {loadingImage ? 'Генерация...' : 'Сгенерировать фото'}
       </button>


      {result && <p className="result">{result}</p>}

      {showExamples && examples.length > 0 && (
        <div className="examples-section">
          <h4>Примеры использования:</h4>
          <ul>
            {examples.map((ex, idx) => (
              <li key={idx}>
                <WordHighlighter
                  text={ex}
                  selectedWord={selectedWord}
                  onWordClick={handleWordClick}
                />
              </li>
            ))}
          </ul>
        </div>
      )}
      {showModal && wordInfo && (
  <div className="modal-overlay" onClick={() => setShowModal(false)} style={overlayStyle}>
    <div className="modal-content" onClick={(e) => e.stopPropagation()} style={modalStyle}>
      <button onClick={() => setShowModal(false)} style={closeButtonStyle}>×</button>
      <h3>Слово: <em>{selectedWord}</em></h3>
      <p><strong>Перевод:</strong> {wordInfo.translation}</p>
      {wordInfo.examples && (
        <div>
          <strong>Примеры:</strong>
          <ul>
            {wordInfo.examples.split('\n').filter(Boolean).map((ex, idx) => (
              <li key={idx}>{ex}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  </div>
)}
{generatedImageUrl && (
  <div className="generated-image-section">
    <h4>Угадай слово по картинке:</h4>
    <img
      key={generatedImageUrl} // ДОБАВЛЯЕМ key !!!
      src={generatedImageUrl}
      alt="Generated"
      style={{ maxWidth: '100%', height: 'auto', marginTop: '10px' }}
    />
  </div>
)}
    </div>
  );
}

export default WordGuessPage;


const overlayStyle = {
  position: 'fixed',
  top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000
};

const modalStyle = {
  backgroundColor: '#fff',
  padding: '20px',
  borderRadius: '10px',
  maxWidth: '500px',
  width: '90%',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
  position: 'relative'
};

const closeButtonStyle = {
  position: 'absolute',
  top: '10px',
  right: '10px',
  fontSize: '1.5rem',
  background: 'none',
  border: 'none',
  cursor: 'pointer'
};
