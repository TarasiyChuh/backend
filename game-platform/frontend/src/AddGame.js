// src/components/AddGame.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AddGame = ({ token }) => {
  const [title, setTitle]           = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice]           = useState('');
  const [error, setError]           = useState(null);
  const [message, setMessage]       = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setError('Увійдіть, щоб додати гру');
      return;
    }
    try {
      const res = await fetch('/api/games', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title, description, price: Number(price) })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Помилка додавання гри');
      } else {
        setMessage('Гру додано успішно');
        setTitle('');
        setDescription('');
        setPrice('');
        setTimeout(() => navigate('/'), 2000);
      }
    } catch (err) {
      console.error(err);
      setError('Сталася помилка');
    }
  };

  return (
    <div>
      <h2>Додати гру</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {message && <p style={{ color: 'green' }}>{message}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Назва гри: </label>
          <input type="text" value={title}
                 onChange={(e) => setTitle(e.target.value)}
                 required />
        </div>
        <div>
          <label>Опис: </label>
          <textarea value={description}
                    onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div>
          <label>Ціна: </label>
          <input type="number" value={price}
                 onChange={(e) => setPrice(e.target.value)}
                 required />
        </div>
        <button type="submit">Додати гру</button>
      </form>
    </div>
  );
};

export default AddGame;
