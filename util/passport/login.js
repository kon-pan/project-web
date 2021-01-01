// Third party module imports
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
// User defined module imports
const User = require('../../models/user');

passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
    },
    async function (username, password, done) {
      try {
        const user = await User.findByEmail(username);
        if (!user) {
          // User not found
          return done(null, false, { message: 'Incorrect email.' });
        } else {
          // User exists
          const passwordMatch = await bcrypt.compare(password, user.password);

          if (passwordMatch) {
            // Login
            return done(null, user);
          } else {
            return done(null, false, { message: 'Incorrect password.' });
          }
        }
      } catch (err) {
        console.log(err);
      }
    }
  )
);

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(async function (id, done) {
  try {
    const user = await User.findById(id);
    if (user) {
      done(null, user);
    } else {
      return done(new Error('User not found.'));
    }
  } catch (err) {
    console.log(err);
  }
});

module.exports = passport;
