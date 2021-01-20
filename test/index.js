// Test Modules Prepare
const discordAuth = require('../index');
const express = require('express');
const app = express();

// Prepare Body Parser
const bodyParser = require('body-parser');
app.use(bodyParser.json());
const bodyParseN = bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
});

// Add Helmet
const helmet = require('helmet');
app.use(helmet());

// Prepare Cooke Session
const cookieSession = require('cookie-session');
const tinySession = cookieSession({
    keys: ['0000000000', '11111111111']
});

app.use(tinySession);

// Port
const port = 3000;

// Test Config
const tinyAuth = require('./auth.json');
tinyAuth.discordScope = ["identify", "email", "applications.commands"];
const sessionVar = 'access_token';

// Login
app.get('/', (req, res) => {

    // Result
    const result = discordAuth.login(req, res,
        {

            // Auth
            auth: tinyAuth,

            // Query
            query: { redirect: 'redirect' },

            // State
            state: {
                csrfToken: '',
                redirect: ''
            }

        }, (require('../files/getToken/cookie-session')(req, sessionVar)),
    );

    // Complete
    console.log(result);
    return;

});

// Logout
app.get('/logout', (req, res) => {

    // Result
    const result = discordAuth.logout(req, res,
        {

            // Auth
            auth: {
                csrfToken: ''
            },

            // Query
            query: {
                csrfToken: 'csrfToken',
                redirect: 'redirect'
            },

            // State
            access_token: req.session[sessionVar]

        }, (require('../files/getToken/cookie-session')(req, sessionVar)),
    );

    // Complete
    console.log(result);
    return;

});

// Redirect
app.post('/redirect', bodyParseN, (req, res) => {

    // Result
    discordAuth.redirect(req, res,
        {

            // Auth
            auth: tinyAuth,

            // Query
            query: { redirect: 'redirect' },

            // State
            state: {
                csrfToken: '',
                redirect: ''
            }

        }, (require('../files/getToken/cookie-session')(req, sessionVar)),
    ).then(result => {

        // Complete
        console.log(result);
        return;

    }).catch(err => {

        // Complete
        console.error(err);
        return;

    });

    // Complete
    return;

});

// Listen the Server
app.listen(port, () => {
    console.log(`Discord Code Test is being executed in http://localhost:${port}`);
})