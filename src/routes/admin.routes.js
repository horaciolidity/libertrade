const express = require('express');
const router = express.Router();
const { getUsers, depositToUser } = require('../controllers/admin.controller');

router.get('/users', getUsers);
router.post('/deposit', depositToUser);

module.exports = router;
