import React, { useState } from 'react';
import GrammarTest from './GrammarTest';
import VocabularyTest from './VocabularyTest';
import ReadingTest from './ReadingTest';
import ListeningTest from './ListeningTest';
import WritingTest from './WritingTest';
import LevelTest from './LevelTest';

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