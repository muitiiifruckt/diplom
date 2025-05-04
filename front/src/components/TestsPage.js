import React, { useState } from 'react';
import GrammarTest from './tests/GrammarTest';
import VocabularyTest from './tests/VocabularyTest';
import ReadingTest from './tests/ReadingTest';
import ListeningTest from './tests/ListeningTest';
import WritingTest from './tests/WritingTest';
import LevelTest from './tests/LevelTest';

const testTypes = [
  { key: 'grammar', label: 'Грамматика' },
  { key: 'vocabulary', label: 'Лексика' },
  { key: 'reading', label: 'Чтение' },
  { key: 'listening', label: 'Аудирование' },
  { key: 'writing', label: 'Письмо' },
  { key: 'level', label: 'Комплексный тест' },
];

export default function TestsPage({ onReturnToChat }) {
  const [selectedTest, setSelectedTest] = useState(null);

  return (
    <div>
      <h2>Тесты</h2>
      {!selectedTest ? (
        <div>
          <h3>Выберите тип теста:</h3>
          {testTypes.map(t => (
            <button key={t.key} onClick={() => setSelectedTest(t.key)} style={{margin: 8}}>
              {t.label}
            </button>
          ))}
        </div>
      ) : (
        <div>
          <button onClick={() => setSelectedTest(null)}>← Назад к выбору теста</button>
          {selectedTest === 'grammar' && <GrammarTest />}
          {selectedTest === 'vocabulary' && <VocabularyTest />}
          {selectedTest === 'reading' && <ReadingTest />}
          {selectedTest === 'listening' && <ListeningTest />}
          {selectedTest === 'writing' && <WritingTest />}
          {selectedTest === 'level' && <LevelTest />}
        </div>
      )}
    </div>
  );
}