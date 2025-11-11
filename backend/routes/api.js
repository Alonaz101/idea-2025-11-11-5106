const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const Recipe = require('../models/recipe');
const Mood = require('../models/mood');
const UserMoodEntry = require('../models/userMoodEntry');
const UserPreference = require('../models/userPreference');
const Review = require('../models/review');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_here';

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// POST /api/users - Create user
router.post('/users', async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  const existingUser = await User.findOne({ $or: [{ username }, { email }] });
  if (existingUser) {
    return res.status(409).json({ message: 'Username or email already exists' });
  }
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);
  const newUser = new User({ username, email, passwordHash });
  await newUser.save();
  res.status(201).json({ message: 'User created successfully' });
});

// POST /api/users/login - Authenticate user
router.post('/users/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Missing username or password' });
  }
  const user = await User.findOne({ username });
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });
  const validPassword = await bcrypt.compare(password, user.passwordHash);
  if (!validPassword) return res.status(401).json({ message: 'Invalid credentials' });
  const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: '12h' });
  res.json({ token });
});

// POST /api/mood - submit mood
router.post('/mood', authenticateToken, async (req, res) => {
  const { moodId } = req.body;
  if (!moodId) return res.status(400).json({ message: 'Mood id required' });
  const mood = await Mood.findById(moodId);
  if (!mood) return res.status(404).json({ message: 'Mood not found' });
  const entry = new UserMoodEntry({ userId: req.user.id, moodId });
  await entry.save();
  res.status(201).json({ message: 'Mood entry recorded' });
});

// GET /api/recipes - get recipes by mood
router.get('/recipes', authenticateToken, async (req, res) => {
  const moodId = req.query.mood;
  if (!moodId) return res.status(400).json({ message: 'Mood query parameter required' });
  const recipes = await Recipe.find({ moodTags: moodId });
  res.json(recipes);
});

// GET /api/users/:id/favorites - get user's saved recipes
router.get('/users/:id/favorites', authenticateToken, async (req, res) => {
  if (req.user.id !== req.params.id) return res.sendStatus(403);
  const user = await User.findById(req.params.id).populate('savedRecipes');
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user.savedRecipes);
});

// POST /api/users/:id/favorites - save a recipe
router.post('/users/:id/favorites', authenticateToken, async (req, res) => {
  if (req.user.id !== req.params.id) return res.sendStatus(403);
  const { recipeId } = req.body;
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  if (!user.savedRecipes.includes(recipeId)) {
    user.savedRecipes.push(recipeId);
    await user.save();
  }
  res.status(200).json({ message: 'Recipe saved to favorites' });
});

// POST /api/reviews - submit review
router.post('/reviews', authenticateToken, async (req, res) => {
  const { recipeId, rating, comment } = req.body;
  if (!recipeId || !rating) return res.status(400).json({ message: 'Recipe ID and rating are required' });
  const review = new Review({ userId: req.user.id, recipeId, rating, comment });
  await review.save();
  res.status(201).json({ message: 'Review saved' });
});

// GET /api/recipes/:id/reviews - get reviews for a recipe
router.get('/recipes/:id/reviews', async (req, res) => {
  const reviews = await Review.find({ recipeId: req.params.id }).populate('userId', 'username');
  res.json(reviews);
});

module.exports = router;
