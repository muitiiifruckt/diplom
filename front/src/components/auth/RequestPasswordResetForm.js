import React, { useState } from 'react';

const RequestPasswordResetForm = ({ onSubmit, onBack }) => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(email);  // Вызовем переданную функцию onSubmit с email
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Запрос на сброс пароля</h2>
      <input
        type="email"
        placeholder="Введите ваш email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <button type="submit">Отправить</button>
      <button type="button" onClick={onBack}>Назад</button>
    </form>
  );
};

export default RequestPasswordResetForm;
