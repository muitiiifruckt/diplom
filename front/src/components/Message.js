const Message = ({ message }) => {
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
        <p>{message.content}</p>
      )}
      <span className="timestamp">{message.timestamp}</span>
    </div>
  );
};

export default Message;
