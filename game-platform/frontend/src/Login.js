import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Помилка логіну');
      } else {
        onLogin(data.token); // Зберігаємо токен
        navigate('/'); // Перенаправляємо користувача після успішного логіну
      }
    } catch (err) {
      console.error(err);
      setError('Сталася помилка');
    }
  };

  return (
    <div>
      <h2>Логін</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email: </label>
          <input type="email" value={email}
                 onChange={(e) => setEmail(e.target.value)}
                 required />
        </div>
        <div>
          <label>Пароль: </label>
          <input type="password" value={password}
                 onChange={(e) => setPassword(e.target.value)}
                 required />
        </div>
        <button type="submit">Увійти</button>
      </form>
    </div>
  );
};

export default Login;
