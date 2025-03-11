// src/components/Cart.js
import React, { useState, useEffect } from 'react';

const Cart = ({ token }) => {
  const [cart, setCart]   = useState([]);
  const [error, setError] = useState(null);

  const fetchCart = async () => {
    if (!token) {
      setError('Увійдіть, щоб переглянути корзину');
      return;
    }
    try {
      const res = await fetch('/api/cart', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Помилка отримання корзини');
      } else {
        setCart(data.cart);
      }
    } catch (err) {
      console.error(err);
      setError('Сталася помилка');
    }
  };

  useEffect(() => {
    fetchCart();
  }, [token]);

  return (
    <div>
      <h2>Корзина</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {cart.length === 0 ? (
        <p>Корзина порожня</p>
      ) : (
        <ul>
          {cart.map(game => (
            <li key={game._id}>
              {game.title} - {game.price} грн.
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Cart;
