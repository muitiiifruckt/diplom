import { useState, useEffect, useCallback } from 'react';

function WordGuessPage({ onReturnToChat }) {
  const [word, setWord] = useState('');
  const [userTranslation, setUserTranslation] = useState('');
  const [result, setResult] = useState(null);
  const [examples, setExamples] = useState([]);
  const [showExamples, setShowExamples] = useState(false);
  const [loadingExamples, setLoadingExamples] = useState(false);

  const fetchWord = useCallback(() => {
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
  }, []);

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
    fetch('http://localhost:8000/examples', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ word })
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

  useEffect(() => {
    fetchWord();
  }, [fetchWord]);

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

      {result && <p className="result">{result}</p>}

      {showExamples && examples.length > 0 && (
        <div className="examples-section">
          <h4>Примеры использования:</h4>
          <ul>
            {examples.map((ex, idx) => (
              <li key={idx}>{ex}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default WordGuessPage;
