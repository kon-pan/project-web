const { session } = require('passport');

exports.isAuth = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    req.session.returnTo = req.path;
    res.redirect('/login');
  }
};

exports.isAdmin = (req, res, next) => {
  if (req.isAuthenticated() && req.user.admin) {
    next();
  } else {
    req.session.returnTo = req.path;
    res.redirect('/login');
  }
};
