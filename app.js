// Third party module imports
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const flash = require('connect-flash');
// User defined module imports
const userRoutes = require('./routes/user');
const adminRoutes = require('./routes/admin');
const passport = require('./util/passport/login');
const db = require('./db/db');

const app = express();
const port = 3000;

// Set view engine and view templates location
app.set('view engine', 'ejs');
app.set('views', 'views');

// Set static folder location and url
app.use('/static', express.static('public'));

// Parse application/x-www-form-urlencoded POST data
app.use(bodyParser.urlencoded({ extended: true }));
// Parse json POST data
app.use(bodyParser.json({ limit: '20mb', extended: true }));

// Initialize session
app.use(
  session({
    secret: 'secret', // TODO: move to .env file
    resave: false,
    saveUninitialized: true,
  })
);
app.use(flash()); // required for flash messages

// Initialize PassportJS
app.use(passport.initialize());
app.use(passport.session());

app.use(userRoutes);
app.use('/admin', adminRoutes);

app.listen(port, async () => {
  console.log(`App listening to port ${port}`);
  // const result = await db.query('SELECT NOW()');
  // console.log(result.rows[0]);
});
