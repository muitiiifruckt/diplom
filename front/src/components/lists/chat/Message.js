import React from 'react';

function Message({ message }) {
  return (
    <div className={`message ${message.sender}`}>
      {message.type === 'text' && <span>{message.content}</span>}
      {message.type === 'audio' && (
        <audio controls src={message.content}></audio>
      )}
      {message.type === 'loading' && <span>{message.content}</span>}
    </div>
  );
}

export default Message;