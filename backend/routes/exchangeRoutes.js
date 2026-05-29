const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');
const ctrl = require('../controllers/skillExchangeController');

router.post('/', auth, ctrl.createExchange);
router.get('/my', auth, ctrl.getMyExchanges);
router.get('/my/stats', auth, ctrl.getMyStats);
router.get('/', auth, admin, ctrl.getAllExchangesAdmin);
router.put('/:id/respond', auth, ctrl.respond);
router.put('/:id/complete', auth, ctrl.complete);
router.get('/stats', auth, admin, ctrl.stats);

module.exports = router;
