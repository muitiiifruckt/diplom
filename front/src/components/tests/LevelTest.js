import React, { useState } from 'react';

export default function LevelTest() {
  const [test, setTest] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);

  const fetchTest = async () => {
    const resp = await fetch('http://localhost:8000/api/tests/level');
    const data = await resp.json();
    setTest(data);
    setAnswers({});
    setResult(null);
  };

  const handleChange = (section, idx, value) => {
    setAnswers(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] || {}),
        [idx]: value
      }
    }));
  };

  const handleWritingChange = (value) => {
    setAnswers(prev => ({
      ...prev,
      writing: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const resp = await fetch('http://localhost:8000/api/tests/level/evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(answers)
    });
    let data = await resp.json();
    // Если сервер вернул строку, а не объект, попробуем распарсить
    if (typeof data === "string") {
      try {
        data = JSON.parse(data);
      } catch (e) {
        setResult({ feedback: "Ошибка парсинга результата", raw: data });
        return;
      }
    }
    setResult(data);
  };

  return (
    <div>
      <h3>Комплексный тест уровня английского</h3>
      {!test ? (
        <button onClick={fetchTest}>Начать тест</button>
      ) : (
        <form onSubmit={handleSubmit}>
          {/* Grammar */}
          <h4>Грамматика</h4>
          {test.grammar.map((q, idx) => {
            const options = [q.answer, ...q.distractors].sort(() => Math.random() - 0.5);
            return (
              <div key={idx}>
                <div>{q.sentence}</div>
                {options.map((opt, i) => (
                  <label key={i} style={{marginRight: 10}}>
                    <input
                      type="radio"
                      name={`grammar-${idx}`}
                      value={opt}
                      checked={answers.grammar && answers.grammar[idx] === opt}
                      onChange={() => handleChange('grammar', idx, opt)}
                    />
                    {opt}
                  </label>
                ))}
              </div>
            );
          })}

          {/* Vocabulary */}
          <h4>Лексика</h4>
          {test.vocabulary.map((q, idx) => {
            const options = [q.answer, ...q.distractors].sort(() => Math.random() - 0.5);
            return (
              <div key={idx}>
                <div>{q.word}</div>
                {options.map((opt, i) => (
                  <label key={i} style={{marginRight: 10}}>
                    <input
                      type="radio"
                      name={`vocabulary-${idx}`}
                      value={opt}
                      checked={answers.vocabulary && answers.vocabulary[idx] === opt}
                      onChange={() => handleChange('vocabulary', idx, opt)}
                    />
                    {opt}
                  </label>
                ))}
              </div>
            );
          })}

          {/* Reading */}
          <h4>Чтение</h4>
          <div style={{background: '#f9f9f9', padding: 8, borderRadius: 6, marginBottom: 8}}>
            {test.reading.story}
          </div>
          {test.reading.questions.map((q, idx) => {
            const options = [q.answer, ...q.distractors].sort(() => Math.random() - 0.5);
            return (
              <div key={idx}>
                <div>{q.question}</div>
                {options.map((opt, i) => (
                  <label key={i} style={{marginRight: 10}}>
                    <input
                      type="radio"
                      name={`reading-${idx}`}
                      value={opt}
                      checked={answers.reading && answers.reading[idx] === opt}
                      onChange={() => handleChange('reading', idx, opt)}
                    />
                    {opt}
                  </label>
                ))}
              </div>
            );
          })}

          {/* Listening */}
          <h4>Аудирование</h4>
          {test.listening.map((q, idx) => {
            const options = [q.answer, ...q.distractors].sort(() => Math.random() - 0.5);
            return (
              <div key={idx}>
                <audio controls src={`http://localhost:8000${q.audio_url}`} />
                <div>{q.question}</div>
                {options.map((opt, i) => (
                  <label key={i} style={{marginRight: 10}}>
                    <input
                      type="radio"
                      name={`listening-${idx}`}
                      value={opt}
                      checked={answers.listening && answers.listening[idx] === opt}
                      onChange={() => handleChange('listening', idx, opt)}
                    />
                    {opt}
                  </label>
                ))}
              </div>
            );
          })}

          {/* Writing */}
          <h4>Письмо</h4>
          <div><b>Тема:</b> {test.writing_prompt}</div>
          <textarea
            rows={5}
            style={{width: '100%', marginTop: 8}}
            value={answers.writing || ''}
            onChange={e => handleWritingChange(e.target.value)}
            placeholder="Введите ваш текст..."
          />

          <button type="submit" style={{marginTop: 16}}>Отправить на проверку</button>
        </form>
      )}
      {result && (
        <div style={{marginTop: 24, background: '#f0f0f0', padding: 12, borderRadius: 8}}>
          <h4>Результат</h4>
          <b>Общий балл:</b> {result.score} <br/>
          <b>Уровень:</b> {result.level} <br/>
          <b>Общий фидбэк:</b> {result.feedback} <br/>
          <b>По разделам:</b>
          <ul>
            {result.section_feedback && Object.entries(result.section_feedback).map(([section, fb]) => (
              <li key={section}><b>{section}:</b> {fb}</li>
            ))}
          </ul>
          {result.raw && (
            <div style={{color: 'red', marginTop: 8}}>
              <b>Raw:</b> {result.raw}
            </div>
          )}
        </div>
      )}
    </div>
  );
}