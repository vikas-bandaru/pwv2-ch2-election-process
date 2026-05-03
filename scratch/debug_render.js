const ejs = require('ejs');
const path = require('path');
const fs = require('fs');

const viewsDir = path.join(__dirname, 'views');
const loginPath = path.join(viewsDir, 'login.ejs');

const data = {
    title: 'Civic Role Selection',
    attemptCount: 0,
    voterName: null,
    budget: { totalCost: '0.0000', limit: 5.00, remaining: '5.0000' },
    locals: {
        title: 'Civic Role Selection',
        attemptCount: 0,
        voterName: null,
        budget: { totalCost: '0.0000', limit: 5.00, remaining: '5.0000' }
    }
};

try {
    const template = fs.readFileSync(loginPath, 'utf8');
    ejs.render(template, data, { filename: loginPath }, (err, html) => {
        if (err) {
            console.error('RENDER ERROR:', err);
        } else {
            console.log('RENDER SUCCESS');
        }
    });
} catch (e) {
    console.error('SYSTEM ERROR:', e);
}
