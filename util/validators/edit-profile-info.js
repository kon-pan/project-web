// Third party module imports
const { check } = require('express-validator');
const capitalize = require('capitalize');
const bcrypt = require('bcrypt');
// User defined module imports
const User = require('../../models/user');

const editPorfileInfoValidator = [
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
    .customSanitizer((value, { req }) => {
      // console.log(value);
      // console.log(req.user);
      // console.log(req.body)
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
    .custom((value, { req }) => {
      return new Promise(async (resolve, reject) => {
        if (req.user.username === value) {
          // user didn't edit the username field
          console.log('username unchanged');
          resolve(true);
        } else {
          // username field is edited - check if edited value
          // already exists in the database
          console.log('username edited');
          const userExists = await User.findByUsername(value);
          if (userExists) {
            console.log('username already exists');
            reject('Username already exists.');
          } else {
            // edited username value is available
            resolve(true);
          }
        }
      });
    }),
  check('password')
    .if((value, { req }) => {
      return new Promise((resolve, reject) => {
        if (value === '') {
          // user didn't provide a new password -> reject
          reject(); // will not create error
        } else {
          // user edited password field - continue through validation chain
          resolve(true);
        }
      });
    })
    .isLength({ min: 8 })
    .withMessage('Password should be at least 8 characters.')
    .bail()
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})|^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,}|)$/
    )
    .withMessage(
      'Password must have at least 1 lowercase, 1 uppercase, 1 number and 1 special character.'
    )
    .bail()
    .custom((value, { req }) => {
      return new Promise(async (resolve, reject) => {
        const compare = await bcrypt.compare(value, req.user.password);
        console.log(compare);
        if (compare) {
          // if edited password is the same as the previous one
          reject('Please provide a different password than your previous one.');
        } else {
          // at this point the edited password has passed all validation steps
          resolve(true);
        }
      });   
    }),
];

module.exports = editPorfileInfoValidator;
