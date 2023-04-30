// ℹ️ Gets access to environment variables/settings
// https://www.npmjs.com/package/dotenv
require('dotenv/config');

// ℹ️ Connects to the database
require('./db');

// Handles http requests (express is node js framework)
// https://www.npmjs.com/package/express
const express = require('express');

// Handles the handlebars
// https://www.npmjs.com/package/hbs
const hbs = require('hbs');

const helpers = require('handlebars-helpers');
hbs.registerHelper(helpers());

const app = express();

// ℹ️ This function is getting exported from the config folder. It runs most middlewares
require('./config')(app);

const session = require('express-session');
const mongoStore = require('connect-mongo');
app.use(
  session({
    resave: true,
    saveUinitialized: true,
    secret: process.env.SESSION_SECRET,
    cookie: {
      sameSite: true, //fe and be are running on localhost
      httpOnly: true, // we are not using https
      maxAge: 60000 // session time in milliseconds
    },
    rolling: true,
    store: new mongoStore({
      mongoUrl: process.env.MONGODB_URI,
      ttl: 60 * 60 * 24 //1day
    })
  })
);

// default value for title local
const projectName = 'lab-express-basic-auth';
const capitalized = string =>
  string[0].toUpperCase() + string.slice(1).toLowerCase();

app.locals.title = `${capitalized(projectName)}- Generated with Ironlauncher`;

// 👇 Start handling routes here
const index = require('./routes/index');
app.use('/', index);

const authRoutes = require('./routes/auth.routes');
const authMiddleware = require('./middleware/authmiddleware');
app.use('/', authRoutes);

const authMiddlewareRoutes = require('./middleware/authmiddleware');

// ❗ To handle errors. Routes that don't exist or errors that you handle in specific routes
require('./error-handling')(app);

module.exports = app;
