require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');
const budgetMiddleware = require('./middleware/budget');

const app = express();
const PORT = process.env.PORT || 3000;

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: 'civic-logic-secret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
}));
app.use(budgetMiddleware);
app.use((req, res, next) => {
    res.locals.voterName = (req.session && req.session.voterName) ? req.session.voterName : null;
    res.locals.attemptCount = (req.session && req.session.attemptCount) ? req.session.attemptCount : 1;
    res.locals.budget = (typeof req.getBudgetStatus === 'function') ? req.getBudgetStatus() : { totalCost: '0.0000', limit: 5.00 };
    next();
});



// Routes
const authRoutes = require('./routes/auth');
const simulateRoutes = require('./routes/simulate');
const resultsRoutes = require('./routes/results');

app.use('/auth', authRoutes);
app.use('/simulate', simulateRoutes);
app.use('/results', resultsRoutes);

app.get('/api/reset-session', (req, res) => {
    // Increment attempt count
    req.session.attemptCount = (req.session.attemptCount || 0) + 1;
    // Clear simulation state
    delete req.session.voterData;
    // Redirect to Role Selection (Login)
    res.redirect('/auth/login');
});

app.get('/', (req, res) => {
    res.redirect('/auth/login');
});


// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send(`<h1>Something broke!</h1><pre>${err.message}\n${err.stack}</pre>`);
});


app.listen(PORT, () => {
    console.log(`CivicLogic Simulator running at http://localhost:${PORT}`);
});
