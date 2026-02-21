const express = require('express');
const router = express.Router();
const { getCurrentRecord } = require('../controllers/streamController');

router.get('/current', getCurrentRecord);

module.exports = router;
