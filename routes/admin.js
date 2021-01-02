// Third party module imports
const express = require('express');
const passport = require('passport');
// User defined module imports
const adminController = require('../controllers/admin');
const { isAuth, isAdmin } = require('../util/auth');

const router = express.Router();

router.get('/login', adminController.getLogin);
router.post(
  '/login',
  passport.authenticate('local', {
    successReturnToOrRedirect: '/admin/',
    failureRedirect: '/admin/login',
    failureFlash: 'Incorrect email/password combination.',
    successFlash: 'Welcome!',
  })
);

router.get('/', isAdmin ,adminController.getIndex);

module.exports = router;
