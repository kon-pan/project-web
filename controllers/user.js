// Node.JS core module imports
const fs = require('fs');
const path = require('path');
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

exports.postEditProfileInfo = async (req, res, next) => {
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
    // If req.body.password === '', then keep req.user.password
    if (req.body.password === '') {
      // User hasn't edited the password
      req.body.password = req.user.password;
    } else {
      // User has provided a new password - Encrypt it
      req.body.password = await bcrypt.hash(req.body.password, 10);
    }

    // Edit user info in database
    const editSuccess = await User.edit(req.params.userId, req.body);

    if (editSuccess) {
      res.json({
        editSuccess: true,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        username: req.body.username,
      });
    }
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

// Handle POST request from Fetch API in upload.js(client)
exports.postDownloadData = async (req, res, next) => {
  // Function that accepts uploaded file from user and saves it
  // in JSON format in static files folder at location /public/json.
  // Immediatly after this file is created, it is served to the user
  // and deleted.
  console.log(req.query);
  const userId = req.user.id;
  const jsonData = JSON.stringify(req.body, null, 4);

  fs.writeFile(`./public/json/temp-user${userId}.json`, jsonData, (err) => {
    if (err) {
      throw err;
    }
    console.log('JSON data is saved.');
    res.json({ fileName: `temp-user${userId}.json` }); // returned to fetch for #download-btn in upload.js
  });
};

exports.getDownloadData = (req, res, next) => {
  const fileName = req.params.fileName;
  const rootPath = path.dirname(require.main.filename); // Project root path
  const filePath = path.join(rootPath + '/public/json/' + fileName);
  console.log(fileName);
  console.log(rootPath);
  console.log(filePath);
  res.location('/profile');
  res.download(filePath, 'har.json', function (err) {
    if (err) {
      // Handle error, but keep in mind the response may be partially-sent
      // so check res.headersSent
      console.log('ERROR WHILE DOWNLOADING FILE');
    } else {
      fs.unlink(filePath, (err) => {
        if (err) throw err;
        console.log(`File at path "${filePath}" was deleted`);
      });
    }
  });
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
