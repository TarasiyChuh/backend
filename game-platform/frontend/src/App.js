// src/App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './Navbar';
import Login from './Login';
import Register from './Register';
import GamesList from './GamesList';
import GameDetails from './GameDetails';
import AddGame from './AddGame';
import Cart from './Cart';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || null);

  const handleLogin = (token) => {
    setToken(token);
    localStorage.setItem('token', token);
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('token');
  };

  return (
    <Router>
      <Navbar token={token} onLogout={handleLogout} />
      <div className="container" style={{ padding: '20px' }}>
        <Routes>
          <Route path="/" element={<GamesList token={token} />} />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/games/:id" element={<GameDetails token={token} />} />
          <Route path="/add-game" element={<AddGame token={token} />} />
          <Route path="/cart" element={<Cart token={token} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
