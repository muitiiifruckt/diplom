import React, { useState } from 'react';

function RegisterForm({ onRegister, onLoginClick }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onRegister(username, password);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Регистрация</h2>
      <input
        type="text"
        placeholder="Имя пользователя"
        value={username}
        onChange={e => setUsername(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Пароль"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
      />
      <button type="submit">Зарегистрироваться</button>
      <button type="button" onClick={onLoginClick}>Войти</button>
    </form>
  );
}

export default RegisterForm;