const { Router } = require('express');
const { rastrear, rastrearLote } = require('../controllers/rastreamento.controller');

const router = Router();

router.get('/:codigo', rastrear);
router.post('/lote', rastrearLote);

module.exports = router;
