import { useState, useEffect, useCallback } from 'react';

function WordGuessPage({ onReturnToChat }) {
  const [word, setWord] = useState('');
  const [userTranslation, setUserTranslation] = useState('');
  const [result, setResult] = useState(null);

  // Оборачиваем fetchWord в useCallback, чтобы useEffect не ругался
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

      {/* Кнопка для возвращения в чат */}
      <button onClick={onReturnToChat}>Вернуться в чат</button>

      {result && <p className="result">{result}</p>}
    </div>
  );
}

export default WordGuessPage;
