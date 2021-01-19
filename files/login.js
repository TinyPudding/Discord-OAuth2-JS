
module.exports = async function (req, res, cfg, existSession) {

    // Modules
    const _ = require('lodash');
    const objType = require('@tinypudding/puddy-lib/get/objType');
    const http_status = require('@tinypudding/puddy-lib/http/HTTP-1.0');

    // Default Values State
    let tinyState = _.defaultsDeep({}, cfg.state, {
        csrfToken: '',
        redirect: ''
    });

    // Validate State
    if (objType(tinyState, 'object')) {

        // Create Settings
        const tinyQuery = _.defaultsDeep({}, cfg.query, {
            csrfToken: 'csrfToken',
            redirect: 'redirect'
        });

        // Create Settings
        const tinyCfg = _.defaultsDeep({}, cfg.auth, {
            redirect: 'http://localhost/redirect',
            scope: [],
            discordID: ''
        });

        // Exist Cfg
        if (objType(tinyCfg, 'object') && objType(tinyQuery, 'object')) {

            // Don't exist session
            if (!existSession) {

                // Redirect Fixed
                if (typeof tinyCfg.redirect === "string") {
                    tinyCfg.redirect = encodeURIComponent(tinyCfg.redirect);
                } else {
                    tinyCfg.redirect = '';
                }

                // Scopes
                tinyCfg.scopeURI = '';

                if (Array.isArray(tinyCfg.scope)) {
                    for (const item in tinyCfg.scope) {
                        if (tinyCfg.scopeURI) {
                            tinyCfg.scopeURI += '%20';
                        }
                        tinyCfg.scopeURI += encodeURIComponent(tinyCfg.scope[item]);
                    }
                }

                // Redirect
                if (objType(req.query, 'object') && typeof req.query[tinyQuery.redirect] === "string") {

                    if (req.query[tinyQuery.redirect].startsWith('/')) {
                        req.query[tinyQuery.redirect] = req.query[tinyQuery.redirect].substring(1);
                    }

                    tinyState.redirect = req.query[tinyQuery.redirect];

                }

                tinyState = encodeURIComponent(JSON.stringify(tinyState));

                // Redirect URL
                return res.redirect(`https://discord.com/api/oauth2/authorize?client_id=${tinyCfg.discordID}&scope=${tinyCfg.scopeURI}&response_type=code&redirect_uri=${tinyCfg.redirect}&state=${tinyState}`);

            }

            // Yes
            else { return res.redirect('/'); }

        }

        // Nope
        else {
            http_status.send(res, 400);
        }

    }

    // Error
    else {
        http_status.send(res, 400);
    }

}