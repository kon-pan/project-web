// Third party module imports
const express = require('express');
const passport = require('passport');
// User defined module imports
const userController = require('../controllers/user');
const registerValidator = require('../util/validators/register');
const editPorfileInfoValidator = require('../util/validators/edit-profile-info');
const { isAuth } = require('../util/auth');

const router = express.Router();

router.get('/login', userController.getLogin);
router.post(
  '/login',
  passport.authenticate('local', {
    successReturnToOrRedirect: '/',
    failureRedirect: '/login',
    failureFlash: 'Incorrect email/password combination.',
    successFlash: 'Welcome!',
  })
);

router.get('/logout', function (req, res) {
  req.logout();
  res.redirect('/');
});

router.get('/register', userController.getRegister);
router.post('/register', registerValidator, userController.postRegister);

router.post('/profile/edit/:userId', editPorfileInfoValidator, userController.postEditProfileInfo);
router.get('/profile/:userId', isAuth, userController.getProfile);

router.get('/upload', isAuth, userController.getUpload);
router.post('/upload/upload-data', userController.postUploadData);

router.get('/', userController.getIndex);

module.exports = router;
