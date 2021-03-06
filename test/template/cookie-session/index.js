module.exports = function (webItem = { type: 'default' }) {

    // Test Modules Prepare
    const discordAuth = require('../../../template/cookie-session');
    const express = require('express');
    const app = express();

    // Add Helmet
    const helmet = require('helmet');
    app.use(helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'", "'unsafe-inline'", 'https://securetoken.googleapis.com/', 'https://www.googleapis.com/', "https://www.gstatic.com/firebasejs/", "https://cdnjs.cloudflare.com/ajax/libs/jquery/", "https://cdnjs.cloudflare.com/ajax/libs/jquery-loading-overlay/"]
            }
        }
    }));

    // Prepare Cookie Session
    const cookieSession = require('cookie-session');
    const tinySession = cookieSession({
        keys: ['0000000000', '11111111111']
    });

    // Session Vars
    const sessionVars = {
        access_token: 'access_token',
        token_expires_in: 'token_expires_in'
    };

    app.use(tinySession);

    // Add CSRF Token Session Cookie
    const csrfTokenSessionCookie = require('@tinypudding/csrftoken-lib/template/cookie-session');
    app.use(csrfTokenSessionCookie());

    // Port
    const port = 5000;

    // Auth
    const tinyAuth = require('../../auth.json');
    tinyAuth.discordScope = ["identify", "email", "guilds", "guilds.join", "connections", "gdm.join"];

    // Result
    const authOptions = { auth: tinyAuth, vars: sessionVars, bodyParser: require('body-parser'), port: port };

    // Firebase
    if (webItem.type === "firebase") { authOptions.firebase = webItem.app; authOptions.cfg = webItem.cfg; }

    // Send Auth
    const dsFunctions = discordAuth(app, authOptions);

    // Homepage
    app.get('/', dsFunctions.sessionPlugins.validator, (req, res) => {
        res.send(`
            <script src="https://www.gstatic.com/firebasejs/8.2.6/firebase-app.js"></script>
            <script src="https://www.gstatic.com/firebasejs/8.2.6/firebase-auth.js"></script>
            <script>
                // Your web app's Firebase configuration
                var firebaseConfig = ${JSON.stringify(require('./firebase/html_values.json'))};
                // Initialize Firebase
                firebase.initializeApp(firebaseConfig);
                firebase.auth().onAuthStateChanged(function (user) {
                    console.log(user);
                    getTokenResult = function() {
                        user
                            .getIdTokenResult()
                            .then((idTokenResult) => {
                                console.log(idTokenResult);
                                return;
                            })
                    };
                });
                let getTokenResult = null;
            </script>
            Tiny Homepage :3
        `);
        return;
    });

    // CSRF Token
    app.get('/csrfToken', dsFunctions.sessionPlugins.validator, (req, res) => {
        res.json(req.csrfToken);
        return;
    });

    // Get Session
    app.get('/session', dsFunctions.sessionPlugins.validator, (req, res) => {
        return res.json(req.session);
    });

    // Get Firebase Session
    app.get('/firebase', dsFunctions.sessionPlugins.validator, (req, res) => {
        return res.json(req.firebase_session);
    });

    // User Page
    app.get('/user', dsFunctions.sessionPlugins.getUser, dsFunctions.sessionPlugins.validator, (req, res) => {

        // Not Errors
        if (!req.discord_session.errors) {

            // Result
            if (req.discord_session.user) {
                res.json(req.discord_session.user);
            }

            // Nope
            else {
                res.send('No Account Detect');
            }

        }

        // Yes
        else { res.json(req.discord_session.errors); }

        // Complete
        return;

    });

    app.get('/user/connections', dsFunctions.sessionPlugins.getUserConnections, dsFunctions.sessionPlugins.validator, (req, res) => {

        // Not Errors
        if (!req.discord_session.errors) {

            // Result
            if (req.discord_session.connections) {
                res.json(req.discord_session.connections);
            }

            // Nope
            else {
                res.send('No Account User Detect');
            }

        }

        // Yes
        else { res.json(req.discord_session.errors); }

        // Complete
        return;

    });

    app.get('/user/guilds', dsFunctions.sessionPlugins.getUserGuilds, dsFunctions.sessionPlugins.validator, (req, res) => {

        // Not Errors
        if (!req.discord_session.errors) {

            // Result
            if (req.discord_session.guilds) {
                res.json(req.discord_session.guilds);
            }

            // Nope
            else {
                res.send('No Account Guilds Detect');
            }

        }

        // Yes
        else { res.json(req.discord_session.errors); }

        // Complete
        return;

    });

    app.get('/user/all', dsFunctions.sessionPlugins.getUserConnections, dsFunctions.sessionPlugins.getUser, dsFunctions.sessionPlugins.getUserGuilds, dsFunctions.sessionPlugins.validator, (req, res) => {

        // Not Errors
        if (!req.discord_session.errors) {

            // Result
            req.discord_session.uid = dsFunctions.uidGenerator(req.discord_session.user.id);
            res.json(req.discord_session);

        }

        // Yes
        else { res.json(req.discord_session.errors); }

        // Complete
        return;

    });

    // Informations
    app.get('/guild/widget', dsFunctions.sessionPlugins.validator, (req, res) => {

        // Get Widget
        dsFunctions.getGuildWidget(req.query.id).then(data => {
            res.json(data);
        }).then(err => {
            res.json(err);
        });

        // Complete
        return;

    });

    app.get('/user/uid', dsFunctions.sessionPlugins.getUser, dsFunctions.sessionPlugins.validator, (req, res) => {

        // Result
        if (req.discord_session.user) {
            res.json({ result: dsFunctions.uidGenerator(req.discord_session.user.id) });
        }

        // Nope
        else {
            res.send('No Account Connections Detect');
        }

        // Complete
        return;

    });

    // Test Refresh
    app.get('/session/refresh', dsFunctions.sessionPlugins.validator, (req, res) => {

        // Result
        if (typeof req.session[sessionVars.access_token] === "string") {

            // Expire In
            const moment = require('moment-timezone');
            req.session[sessionVars.token_expires_in] = moment.tz('Universal').add(10, 'minute').format();
            res.json(req.session);

        }

        // Nope
        else {
            res.send('No Account Detect');
        }

        // Complete
        return;

    });

    // Test Logout
    app.get('/session/logout', dsFunctions.sessionPlugins.validator, (req, res) => {

        // Result
        if (typeof req.session[sessionVars.access_token] === "string") {

            // Expire In
            const moment = require('moment-timezone');
            req.session[sessionVars.token_expires_in] = moment.tz('Universal').add(-10, 'minute').format();
            res.json(req.session);

        }

        // Nope
        else {
            res.send('No Account Detect');
        }

        // Complete
        return;

    });

    // Error Pages
    app.post('*', (req, res) => { res.status(404); return res.json({ code: 404, message: 'Page Not Found! (POST)' }); });
    app.get('*', (req, res) => { res.status(404); return res.json({ code: 404, message: 'Page Not Found! (GET)' }); });

    // Listen the Server
    app.listen(port, () => {

        console.group(`Discord Code Test is being executed.`);
        console.log(`Main URL: http://localhost:${port}`);
        console.log(`Website Mode: ${webItem.type}`);
        console.groupEnd();

        console.group('Account URLs');
        console.log(`User Page: http://localhost:${port}/guild/widget?id=`);
        console.log(`User Page: http://localhost:${port}/user`);
        console.log(`User Page: http://localhost:${port}/user/connections`);
        console.log(`User Page: http://localhost:${port}/user/guilds`);
        console.log(`User Page: http://localhost:${port}/user/uid`);
        console.log(`User Page: http://localhost:${port}/user/all`);
        console.groupEnd();

        console.group('Session URLs');
        console.log(`Session Page: http://localhost:${port}/session`);
        console.log(`Session Page: http://localhost:${port}/firebase`);
        console.log(`Session Page: http://localhost:${port}/csrfToken`);
        console.log(`Session Logout Page: http://localhost:${port}/session/logout`);
        console.log(`Session Refresh Page: http://localhost:${port}/session/refresh`);
        console.groupEnd();

        console.group('Account URLs with Redirect');
        console.log(`Login: http://localhost:${port}/login`);
        console.log(`Logout: http://localhost:${port}/logout`);
        console.log(`Bot Login: http://localhost:${port}/botlogin`);
        console.log(`Command Login: http://localhost:${port}/commandlogin`);
        console.groupEnd();

    });

    // Complete
    return;

};