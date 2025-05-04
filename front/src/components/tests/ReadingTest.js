import React, { useState } from 'react';

export default function ReadingTest() {
  const [test, setTest] = useState(null);
  const [answers, setAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);

  const fetchTest = async () => {
    const resp = await fetch('http://localhost:8000/api/tests/reading?n=5&questions=3');
    const data = await resp.json();
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
      <h3>Тест по чтению</h3>
      {!test ? (
        <button onClick={fetchTest}>Начать тест</button>
      ) : (
        <div>
          <div style={{ marginBottom: 16, background: '#f9f9f9', padding: 12, borderRadius: 6 }}>
            <b>Текст для чтения:</b>
            <div style={{ marginTop: 8 }}>{test.story}</div>
          </div>
          <form onSubmit={e => { e.preventDefault(); checkAnswers(); }}>
            {test.questions.map((q, idx) => {
              const options = [q.answer, ...q.distractors].sort(() => Math.random() - 0.5);
              return (
                <div key={idx} style={{ marginBottom: 16 }}>
                  <div>{idx + 1}. {q.question}</div>
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
                <b>Ваш результат: {Object.keys(answers).filter(idx => test.questions[idx] && answers[idx] === test.questions[idx].answer).length} из {test.questions.length}</b>
              </div>
            )}
          </form>
        </div>
      )}
    </div>
  );
}