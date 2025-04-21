import { useState } from 'react';
import WordHighlighter from './WordHighlighter';

const Message = ({ message, handleWordClick }) => {
  if (message.type === 'loading') {
    return (
      <div className={`message ${message.sender}`}>
        <p><i>Thinking ... </i></p>
        <span className="timestamp">{message.timestamp}</span>
      </div>
    );
  }

  return (
    <div className={`message ${message.sender}`}>
      {message.type === 'audio' ? (
        <audio controls src={message.content} />
      ) : (
        <div>
          <WordHighlighter
            text={message.content}
            onWordClick={handleWordClick} // Передаем обработчик клика по слову
          />
        </div>
      )}
      <span className="timestamp">{message.timestamp}</span>
    </div>
  );
};

export default Message;
