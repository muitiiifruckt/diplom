import React, { useState } from 'react';

const ResetPasswordForm = ({ onSubmit, onBack }) => {
  const [newPassword, setNewPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(newPassword);  // Вызовем переданную функцию onSubmit с новым паролем
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Сброс пароля</h2>
      <input
        type="password"
        placeholder="Новый пароль"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        required
      />
      <button type="submit">Сбросить пароль</button>
      <button type="button" onClick={onBack}>Назад</button>
    </form>
  );
};

export default ResetPasswordForm;
