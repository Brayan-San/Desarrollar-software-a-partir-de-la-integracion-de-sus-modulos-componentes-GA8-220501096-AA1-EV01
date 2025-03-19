const express = require('express');
const router = express.Router();
const PaymentController = require('../controllers/PaymentController');

// Ruta para procesar un pago
router.post('/process', PaymentController.processPayment);

module.exports = router;
