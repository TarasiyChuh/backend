const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors'); // Додайте CORS
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000', // Замініть на URL вашого фронтенду
  methods: 'GET,POST,PUT,DELETE',
  allowedHeaders: 'Content-Type,Authorization',
}));

const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/gaming_platform';
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB підключено'))
    .catch(err => console.error('Помилка підключення до MongoDB:', err));

// Схеми та моделі Mongoose
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
  cart: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Game' }]
});
const User = mongoose.model('User', userSchema);

const gameSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  description: { type: String },
  price:       { type: Number, required: true },
  ratings: [{
    user:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rating: { type: Number, min: 1, max: 5 }
  }]
});
const Game = mongoose.model('Game', gameSchema);

const commentSchema = new mongoose.Schema({
  game:      { type: mongoose.Schema.Types.ObjectId, ref: 'Game', required: true },
  user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content:   { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
const Comment = mongoose.model('Comment', commentSchema);

// Middleware для перевірки токена JWT
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'Не вказано токен' });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Невірний формат токена' });

  jwt.verify(token, process.env.JWT_SECRET || 'YOUR_SECRET_KEY', (err, decoded) => {
    if (err) return res.status(401).json({ message: 'Невірний або прострочений токен' });
    req.userId = decoded.id;
    next();
  });
};

// Ендпоінти аутентифікації
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password)
      return res.status(400).json({ message: 'Всі поля є обов’язковими' });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: 'Користувач з таким email вже існує' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword });
    await user.save();

    res.status(201).json({ message: 'Користувача зареєстровано успішно' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Помилка сервера' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Email та пароль є обов’язковими' });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: 'Невірні облікові дані' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: 'Невірні облікові дані' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'YOUR_SECRET_KEY', { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Помилка сервера' });
  }
});

// Ендпоінти для ігор
app.post('/api/games', authMiddleware, async (req, res) => {
  try {
    const { title, description, price } = req.body;
    if (!title || price === undefined)
      return res.status(400).json({ message: 'Поля title та price є обов’язковими' });

    const game = new Game({ title, description, price });
    await game.save();

    res.status(201).json({ message: 'Гру додано успішно', game });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Помилка сервера' });
  }
});

app.get('/api/games', async (req, res) => {
  try {
    const games = await Game.find();
    res.json(games);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Помилка сервера' });
  }
});

// Ендпоінти для корзини
app.post('/api/cart', authMiddleware, async (req, res) => {
  try {
    const { gameId } = req.body;
    if (!gameId)
      return res.status(400).json({ message: 'gameId є обов’язковим' });

    const game = await Game.findById(gameId);
    if (!game)
      return res.status(404).json({ message: 'Гру не знайдено' });

    const user = await User.findById(req.userId);
    if (!user)
      return res.status(404).json({ message: 'Користувача не знайдено' });

    user.cart.push(gameId);
    await user.save();

    res.json({ message: 'Гру додано до корзини', cart: user.cart });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Помилка сервера' });
  }
});

app.get('/api/cart', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate('cart');
    if (!user)
      return res.status(404).json({ message: 'Користувача не знайдено' });
    res.json({ cart: user.cart });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Помилка сервера' });
  }
});

// Ендпоінти для коментарів
app.post('/api/games/:gameId/comments', authMiddleware, async (req, res) => {
  try {
    const { gameId } = req.params;
    const { content } = req.body;
    if (!content)
      return res.status(400).json({ message: 'Поле content є обов’язковим' });

    const game = await Game.findById(gameId);
    if (!game)
      return res.status(404).json({ message: 'Гру не знайдено' });

    const comment = new Comment({
      game: gameId,
      user: req.userId,
      content
    });
    await comment.save();

    res.status(201).json({ message: 'Коментар додано', comment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Помилка сервера' });
  }
});

app.get('/api/games/:gameId/comments', async (req, res) => {
  try {
    const { gameId } = req.params;
    const comments = await Comment.find({ game: gameId })
      .populate('user', 'username')
      .sort({ createdAt: -1 });
    res.json(comments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Помилка сервера' });
  }
});

// Ендпоінти для оцінок гри
app.post('/api/games/:gameId/rate', authMiddleware, async (req, res) => {
  try {
    const { gameId } = req.params;
    const { rating } = req.body;
    if (!rating || rating < 1 || rating > 5)
      return res.status(400).json({ message: 'Оцінка має бути від 1 до 5' });

    const game = await Game.findById(gameId);
    if (!game)
      return res.status(404).json({ message: 'Гру не знайдено' });

    const existingRatingIndex = game.ratings.findIndex(r => r.user.toString() === req.userId);
    if (existingRatingIndex !== -1) {
      game.ratings[existingRatingIndex].rating = rating;
    } else {
      game.ratings.push({ user: req.userId, rating });
    }
    await game.save();

    res.json({ message: 'Оцінку збережено', ratings: game.ratings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Помилка сервера' });
  }
});

app.get('/api/games/:gameId/average-rating', async (req, res) => {
  try {
    const { gameId } = req.params;
    const game = await Game.findById(gameId);
    if (!game)
      return res.status(404).json({ message: 'Гру не знайдено' });

    if (game.ratings.length === 0) return res.json({ averageRating: 0 });
    const average = game.ratings.reduce((sum, r) => sum + r.rating, 0) / game.ratings.length;
    res.json({ averageRating: average.toFixed(2) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Помилка сервера' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Сервер запущено на порті ${PORT}`));