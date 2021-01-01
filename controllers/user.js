// Third party module imports
const { validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
// User defined module imports
const User = require('../models/user');
const Har = require('../models/har');

exports.getLogin = (req, res, next) => {
  const flashMsg = req.flash();
  res.render('user/public/login', {
    flashMsg: flashMsg,
  });
};

exports.getRegister = (req, res, next) => {
  const flashMsg = req.flash(); // get flash messages
  if (
    !(Object.keys(flashMsg).length === 0 && flashMsg.constructor === Object)
  ) {
    res.render('user/public/register', {
      errors: true,
      flashMsg: flashMsg,
    });
  } else {
    res.render('user/public/register', {
      errors: true,
      flashMsg: flashMsg,
    });
  }
};

exports.postRegister = async (req, res, next) => {
  // Registration errors
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // Create flash message for each validation error
    // These messages will be shown to user after redirecting
    for (const error of errors.array()) {
      switch (error.param) {
        case 'firstName':
          req.flash('firstNameErr', error.msg);
          break;

        case 'lastName':
          req.flash('lastNameErr', error.msg);
          break;

        case 'username':
          req.flash('usernameErr', error.msg);
          break;

        case 'email':
          req.flash('emailErr', error.msg);
          break;

        case 'password':
          req.flash('passwordErr', error.msg);
          break;

        case 'passwordConfirm':
          req.flash('passwordConfirmErr', error.msg);
          break;

        default:
          break;
      }
    }

    // If an input field value had no errors,
    // save its value in flash message before redirecting
    req.flash('firstNameVal', req.body.firstName);
    req.flash('lastNameVal', req.body.lastName);
    req.flash('usernameVal', req.body.username);
    req.flash('emailVal', req.body.email);

    // Redirect to register page
    res.redirect('/register');
  } else {
    // First encrypt password
    req.body.password = await bcrypt.hash(req.body.password, 10);
    // Insert user to database
    const registerSuccess = await User.create(req.body);
    // If user record was created in database
    if (registerSuccess) {
      req.flash('registerSuccess', 'Your account has been created.');
      res.redirect('/login');
    }
  }
};

exports.getProfile = (req, res, next) => {
  res.render('user/auth/profile', {
    path: '/profile',
    user: req.user,
  });
};

exports.postEditProfileInfo = (req, res, next) => {
  const errors = validationResult(req); // function provided by express-validator

  if (!errors.isEmpty()) {
    // console.log(errors.array());
    let errorMessages = {};
    for (const error of errors.array()) {
      switch (error.param) {
        case 'firstName':
          errorMessages['firstNameErr'] = error.msg;
          break;

        case 'lastName':
          errorMessages['lastNameErr'] = error.msg;
          break;

        case 'username':
          errorMessages['usernameErr'] = error.msg;
          break;

        case 'password':
          errorMessages['passwordErr'] = error.msg;
          break;

        default:
          break;
      }
    }

    console.log(errorMessages);

    res.json(errorMessages);
  } else {
    console.log(req.body);
    // Handle password
    // If req.body.password === null, then keep req.user.password
    // If req.body.password !== null, then encrypt req.body.password
    res.json({ editSuccess: true });
  }
};

exports.getUpload = (req, res, next) => {
  const uploadSuccess = req.query.success ? parseInt(req.query.success) : 0;

  if (uploadSuccess) {
    req.flash('uploadSuccess', 'Upload success.');
    res.redirect('/upload');
  } else {
    const flashMsg = req.flash();
    res.render('user/auth/upload', {
      path: '/upload',
      user: req.user,
      flashMsg: flashMsg,
    });
  }
};

// Handle POST request from Fetch API in upload.js(client)
exports.postUploadData = async (req, res, next) => {
  const data = await Har.process(req.body);
  const uploadSuccess = await Har.upload(data, req.user.id);

  if (uploadSuccess) {
    res.json({ uploadSuccess: true });
  } else {
    res.json({ uploadSuccess: false });
  }
};

exports.getIndex = (req, res, next) => {
  if (req.user) {
    res.render('user/auth/index', {
      path: '/',
      user: req.user,
    });
  } else {
    res.render('user/public/index');
  }
};
