const { check } = require('express-validator');
const capitalize = require('capitalize');

const User = require('../../models/user');

const registerValidator = [
  check('firstName')
    .trim()
    .stripLow()
    .not()
    .isEmpty()
    .withMessage('First name cannot be empty.')
    .bail()
    .isLength({ min: 2, max: 25 })
    .withMessage('First name should be between 2 and 25 characters.')
    .bail()
    .customSanitizer((value) => {
      return capitalize.words(value);
    }),
  check('lastName')
    .trim()
    .stripLow()
    .not()
    .isEmpty()
    .withMessage('Last name cannot be empty.')
    .bail()
    .isLength({ min: 2, max: 25 })
    .withMessage('Last name should be between 2 and 25 characters.')
    .bail()
    .customSanitizer((value) => {
      return capitalize.words(value);
    }),
  check('username')
    .trim()
    .stripLow()
    .not()
    .isEmpty()
    .withMessage('Username cannot be empty.')
    .bail()
    .isLength({ min: 5, max: 15 })
    .withMessage('Username should be between 5 and 15 characters.')
    .bail()
    .matches(/^\S+$/)
    .withMessage('Username should not have spaces.')
    .bail()
    .custom((value) => {
      return new Promise(async (resolve, reject) => {
        const userExists = await User.findByUsername(value);
        if (userExists) {
          reject('Username already exists.');
        } else {
          resolve(true);
        }
      });
    }),
  check('email')
    .isEmail()
    .trim()
    .withMessage('Invalid email address.')
    .bail()
    .custom((value) => {
      return new Promise(async (resolve, reject) => {
        const user = await User.findByEmail(value);
        if (user) {
          reject('Email already exists.');
        } else {
          resolve(true);
        }
      });
    }),
  check('password')
    .not()
    .isEmpty()
    .withMessage('Password cannot be empty.')
    .bail()
    .isLength({ min: 8 })
    .withMessage('Password should be at least 8 characters.')
    .bail()
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})|^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,}|)$/
    )
    .withMessage(
      'Password must have at least 1 lowercase, 1 uppercase, 1 number and 1 special character.'
    )
    .bail(),
  check('passwordConfirm')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error();
      }
      return true;
    })
    .withMessage('Passwords do not match.'),
];

module.exports = registerValidator;
