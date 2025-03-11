import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const GamesList = ({ token }) => {
  const [games, setGames] = useState([]);
  const [error, setError] = useState(null);

  const fetchGames = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/games', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Якщо потрібна авторизація
        }
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Помилка завантаження ігор');
      } else {
        setGames(data);
      }
    } catch (err) {
      console.error(err);
      setError('Сталася помилка');
    }
  };

  useEffect(() => {
    fetchGames();
  }, [token]);

  return (
    <div>
      <h2>Список ігор</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <ul>
        {games.map(game => (
          <li key={game._id}>
            <Link to={`/games/${game._id}`}>{game.title}</Link> - {game.price} грн.
            <a href={`http://localhost:5000/api/games/${game._id}/download`} download>
              Завантажити
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GamesList;
