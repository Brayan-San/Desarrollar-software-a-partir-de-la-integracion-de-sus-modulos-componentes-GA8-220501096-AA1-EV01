const express = require('express');
const { 
    register, 
    login, 
    logout, 
    forgotPassword, 
    resetPassword 
} = require('../controllers/AuthController');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.get('/reset-password', (req, res) => {
    const token = req.query.token;
    res.render('reset-password', { token });
});
router.post('/reset-password', resetPassword);

module.exports = router;