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
    successReturnToOrRedirect: '/admin/home',
    failureRedirect: '/admin/login',
    failureFlash: 'Incorrect email/password combination.',
    successFlash: 'Welcome!',
  })
);

router.get('/logout', function (req, res) {
  req.logout();
  res.redirect('/admin/login');
});

router.get('/get-requests/group-by/method', adminController.getRequestsGroupByMethod);
router.get('/get-responses/group-by/status', adminController.getResponsesGroupByStatus);

router.get('/users', isAdmin, adminController.getUsers);

router.get('/home', isAdmin , adminController.getIndex);

module.exports = router;
