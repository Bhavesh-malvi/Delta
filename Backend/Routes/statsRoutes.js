const express = require('express');
const router = express.Router();
const { getStats, incrementCustomerCount, updateStats } = require('../Controllers/statsController');

router.get('/', getStats);
router.post('/increment', incrementCustomerCount);
router.put('/update', updateStats);

module.exports = router; 