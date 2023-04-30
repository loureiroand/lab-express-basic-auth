const router = require('express').Router();
const User = require('../models/User.model');
const bcrypt = require('bcryptjs');
const authMiddleware = require('../middleware/authmiddleware');

router.get('/signup', (req, res) => {
  res.render('auth/signup');
});

router.post('/signup', async (req, res) => {
  const { username, password } = req.body;

  if (username === '' || password === '') {
    res.render('auth/signup', { errorMessage: 'Fill in all the fields' });
    return;
  }

  const user = await User.findOne({ username });
  if (user !== null) {
    res.render('auth/signup', { errorMessage: 'Username already exists' });
    return;
  }

  const saltRounds = 10;
  const salt = bcrypt.genSaltSync(saltRounds);
  const hashedPassword = bcrypt.hashSync(password, salt);

  await User.create({
    username,
    password: hashedPassword
  });
  res.redirect('/');
});

router.get('/login', (req, res) => {
  res.render('auth/login');
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.render('auth/login', { errorMessage: 'invalid login' });
    return;
  }
  const user = await User.findOne({ username });
  if (!username) {
    res.render('auth/login', { errorMessage: 'invalid login' });
    return;
  }

  //Check password
  if (bcrypt.compareSync(password, user.password)) {
    //passwords match
    req.session.currentUser = user;
    res.redirect('/');
  } else {
    //Passwwords do not match
    res.render('auth/login', { errorMessage: 'Invalid login' });
    return;
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

router.get('/main', authMiddleware, (req, res) => {
  res.render('main');
});

router.post('/main', (req, res) => {
  const { data } = req.body;
  res.redirect('/main');
});

router.get('/private', authMiddleware, (req, res) => {
  res.render('private');
});

router.post('/private', (req, res) => {
  const { data } = req.body;
  res.redirect('/private');
});

module.exports = router;
