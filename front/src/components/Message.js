const Message = ({ message }) => {
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