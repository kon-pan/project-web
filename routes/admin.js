// Third party module imports
const express = require('express');
// User defined module imports
const adminController = require('../controllers/admin');

const router = express.Router();

router.get('/login', adminController.getLogin);

router.get('/', adminController.getIndex);

module.exports = router;
