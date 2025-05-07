import React, { useState } from 'react';

function LoginForm({ onLogin, onRegisterClick }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(username, password);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Вход</h2>
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
      <button type="submit">Войти</button>
      <button type="button" onClick={onRegisterClick}>Регистрация</button>
    </form>
  );
}

export default LoginForm;