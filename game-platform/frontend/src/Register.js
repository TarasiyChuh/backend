import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Помилка реєстрації');
      } else {
        setMessage('Реєстрація успішна, тепер можете увійти.');
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (err) {
      console.error(err);
      setError('Сталася помилка');
    }
  };

  return (
    <div>
      <h2>Реєстрація</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {message && <p style={{ color: 'green' }}>{message}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Ім'я користувача: </label>
          <input type="text" value={username}
                 onChange={(e) => setUsername(e.target.value)}
                 required />
        </div>
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
        <button type="submit">Зареєструватися</button>
      </form>
    </div>
  );
};

export default Register;
