import React, { useState } from 'react';
import { testsService } from '../../../services/api';

export default function VocabularyTest() {
  const [test, setTest] = useState(null);
  const [answers, setAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);

  const fetchTest = async () => {
    const token = localStorage.getItem('token');
    const data = await testsService.fetchVocabularyTest(token, 5);
    setTest(data);
    setAnswers({});
    setShowResult(false);
  };

  const handleSelect = (idx, option) => {
    setAnswers({ ...answers, [idx]: option });
  };

  const checkAnswers = () => {
    setShowResult(true);
  };

  return (
    <div>
      <h3>Тест по лексике</h3>
      {!test ? (
        <button onClick={fetchTest}>Начать тест</button>
      ) : (
        <form onSubmit={e => { e.preventDefault(); checkAnswers(); }}>
          {test.map((q, idx) => {
            const options = [q.answer, ...q.distractors].sort(() => Math.random() - 0.5);
            return (
              <div key={idx} style={{ marginBottom: 16 }}>
                <div>{idx + 1}. {q.word}</div>
                <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
                  {options.map((opt, i) => (
                    <li key={i}>
                      <label>
                        <input
                          type="radio"
                          name={`q${idx}`}
                          value={opt}
                          checked={answers[idx] === opt}
                          onChange={() => handleSelect(idx, opt)}
                          disabled={showResult}
                        />
                        {opt}
                        {showResult && opt === q.answer && (
                          <span style={{ color: 'green', marginLeft: 8 }}>✔</span>
                        )}
                        {showResult && answers[idx] === opt && opt !== q.answer && (
                          <span style={{ color: 'red', marginLeft: 8 }}>✘</span>
                        )}
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
          {!showResult && <button type="submit">Проверить</button>}
          {showResult && (
            <div style={{ marginTop: 16 }}>
              <b>Ваш результат: {Object.keys(answers).filter(idx => test[idx] && answers[idx] === test[idx].answer).length} из {test.length}</b>
            </div>
          )}
        </form>
      )}
    </div>
  );
}