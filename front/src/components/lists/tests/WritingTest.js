import React, { useState } from 'react';
import { testsService } from '../../../services/api';

export default function WritingTest() {
  const [prompt, setPrompt] = useState('');
  const [userText, setUserText] = useState('');
  const [result, setResult] = useState(null);

  const fetchPrompt = async () => {
    const token = localStorage.getItem('token');
    const data = await testsService.fetchWritingPrompt(token);
    setPrompt(data.prompt);
  };

  const evaluate = async () => {
    const token = localStorage.getItem('token');
    const data = await testsService.evaluateWriting(userText, token);
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