const express = require('express');
const router = express.Router();
const { CivicStateMachine } = require('../logic/stateMachine');

router.get('/', (req, res) => {
    if (!req.session.voterName) return res.redirect('/auth/login');
    
    const sm = new CivicStateMachine(req.session);
    const results = sm.calculateResults();
    const budget = req.getBudgetStatus();

    res.render('results', { 
        title: 'Election Results',
        results, 
        voterName: req.session.voterName,
        budget
    });
});

module.exports = router;
