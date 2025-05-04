import React, { useState } from 'react';

export default function WritingTest() {
  const [prompt, setPrompt] = useState('');
  const [userText, setUserText] = useState('');
  const [result, setResult] = useState(null);

  const fetchPrompt = async () => {
    const resp = await fetch('http://localhost:8000/api/tests/writing/prompt');
    const data = await resp.json();
    setPrompt(data.prompt);
  };

  const evaluate = async () => {
    const resp = await fetch('http://localhost:8000/api/tests/writing/evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: userText }),
    });
    const data = await resp.json();
    setResult(data);
  };

  return (
    <div>
      <h3>Тест по письму</h3>
      {!prompt ? (
        <button onClick={fetchPrompt}>Получить тему</button>
      ) : (
        <div>
          <div><b>Тема:</b> {prompt}</div>
          <textarea
            rows={6}
            style={{width: '100%', marginTop: 8}}
            value={userText}
            onChange={e => setUserText(e.target.value)}
            placeholder="Введите ваш рассказ..."
          />
          <button onClick={evaluate} style={{marginTop: 8}}>Оценить</button>
        </div>
      )}
      {result && (
        <div style={{marginTop: 16}}>
          <b>Оценка:</b> {result.score} ({result.level})<br/>
          <b>Комментарий:</b> {result.feedback}
        </div>
      )}
    </div>
  );
}