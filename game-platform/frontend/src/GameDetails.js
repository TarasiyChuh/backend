// src/components/GameDetails.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const GameDetails = ({ token }) => {
  const { id } = useParams();
  const [game, setGame] = useState(null);
  const [comments, setComments] = useState([]);
  const [averageRating, setAverageRating] = useState(null);
  const [commentContent, setCommentContent] = useState('');
  const [rating, setRating] = useState(0);
  const [error, setError] = useState(null);

  // Завантаження деталей гри – для простоти завантажуємо повний список ігор
  const fetchGame = async () => {
    try {
      const res = await fetch('/api/games');
      const data = await res.json();
      const found = data.find(g => g._id === id);
      setGame(found);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/games/${id}/comments`);
      const data = await res.json();
      setComments(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAverageRating = async () => {
    try {
      const res = await fetch(`/api/games/${id}/average-rating`);
      const data = await res.json();
      setAverageRating(data.averageRating);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchGame();
    fetchComments();
    fetchAverageRating();
  }, [id]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setError('Увійдіть, щоб залишити коментар');
      return;
    }
    try {
      const res = await fetch(`/api/games/${id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: commentContent })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Помилка додавання коментаря');
      } else {
        setCommentContent('');
        fetchComments();
      }
    } catch (err) {
      console.error(err);
      setError('Сталася помилка');
    }
  };

  const handleRatingSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setError('Увійдіть, щоб оцінити гру');
      return;
    }
    try {
      const res = await fetch(`/api/games/${id}/rate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ rating: Number(rating) })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Помилка оцінки');
      } else {
        fetchAverageRating();
      }
    } catch (err) {
      console.error(err);
      setError('Сталася помилка');
    }
  };

  if (!game) return <div>Завантаження...</div>;

  return (
    <div>
      <h2>{game.title}</h2>
      <p>{game.description}</p>
      <p>Ціна: {game.price} грн.</p>
      <p>Середня оцінка: {averageRating}</p>

      <div style={{ marginTop: '20px' }}>
        <h3>Оцінити гру</h3>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <form onSubmit={handleRatingSubmit}>
          <label>Оцінка (1-5): </label>
          <input type="number" min="1" max="5" value={rating}
                 onChange={(e) => setRating(e.target.value)}
                 required />
          <button type="submit">Відправити оцінку</button>
        </form>
      </div>

      <div style={{ marginTop: '20px' }}>
        <h3>Коментарі</h3>
        {comments.map(comment => (
          <div key={comment._id} style={{ borderBottom: '1px solid #ccc', marginBottom: '10px' }}>
            <p><strong>{comment.user.username}:</strong> {comment.content}</p>
          </div>
        ))}
        <form onSubmit={handleCommentSubmit}>
          <textarea value={commentContent} onChange={(e) => setCommentContent(e.target.value)}
                    placeholder="Ваш коментар" required style={{ width: '100%', height: '80px' }} />
          <button type="submit">Додати коментар</button>
        </form>
      </div>
    </div>
  );
};

export default GameDetails;
