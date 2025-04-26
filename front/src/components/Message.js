import WordHighlighter from './WordHighlighter';

const Message = ({ message, handleWordClick }) => {
  if (message.type === 'loading') {
    return (
      <div className={`message ${message.sender}`}>
        <p><i>Бот думает...</i></p>
        <span className="timestamp">{message.timestamp}</span>
      </div>
    );
  }

  return (
    <div className={`message ${message.sender}`}>
      {message.type === 'audio' ? (
        <audio controls src={message.content} />
      ) : (
        <WordHighlighter
          text={message.content}
          onWordClick={handleWordClick}
        />
      )}
      <span className="timestamp">{message.timestamp}</span>
    </div>
  );
};

export default Message;
