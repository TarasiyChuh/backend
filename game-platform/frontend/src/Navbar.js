// src/components/Navbar.js
import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = ({ token, onLogout }) => {
  return (
    <nav style={{ padding: '10px', backgroundColor: '#eee' }}>
      <Link to="/">Ігри</Link> |{" "}
      {token ? (
        <>
          <Link to="/add-game">Додати гру</Link> |{" "}
          <Link to="/cart">Корзина</Link> |{" "}
          <button onClick={onLogout}>Вийти</button>
        </>
      ) : (
        <>
          <Link to="/login">Логін</Link> |{" "}
          <Link to="/register">Реєстрація</Link>
        </>
      )}
    </nav>
  );
};

export default Navbar;
