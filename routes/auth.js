const express = require('express');
const router = express.Router();

router.get('/login', (req, res) => {
    const attemptCount = (req.session && req.session.attemptCount) ? req.session.attemptCount : 0;
    res.render('login', { 
        title: 'Civic Role Selection',
        attemptCount: attemptCount
    });
});



router.post('/login', (req, res) => {
    const { name } = req.body;
    if (name) {
        req.session.voterName = name;
        res.redirect('/simulate');
    } else {
        res.redirect('/auth/login');
    }
});

router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/auth/login');
});

module.exports = router;
