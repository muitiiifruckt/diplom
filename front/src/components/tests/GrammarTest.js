import React, { useState } from 'react';

export default function GrammarTest() {
  const [test, setTest] = useState(null);

  const fetchTest = async () => {
    const resp = await fetch('http://localhost:8000/api/tests/grammar?n=5');
    const data = await resp.json();
    setTest(data);
  };

  return (
    <div>
      <h3>Тест по грамматике</h3>
      {!test ? (
        <button onClick={fetchTest}>Начать тест</button>
      ) : (
        <div>
          {test.map((q, idx) => (
            <div key={idx} style={{marginBottom: 16}}>
              <div>{idx + 1}. {q.sentence}</div>
              <ul>
                {[q.answer, ...q.distractors].sort(() => Math.random() - 0.5).map((ans, i) => (
                  <li key={i}>{ans}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}