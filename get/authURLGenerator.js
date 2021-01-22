module.exports = function (tinyCfg, jsonState, tinyCrypto, type) {

    // Redirect Fixed
    let tinyRedirect = '';
    if (typeof tinyCfg.redirect === "string") {
        tinyRedirect = encodeURIComponent(tinyCfg.redirect);
    }

    // Crypto
    const crypto = require('../get/crypto');
    let tinyState = crypto.cipher(tinyCrypto, JSON.stringify(jsonState));
    tinyState = encodeURIComponent(tinyState);

    // Scopes
    let tinyScopeURI = '';

    // Login
    if (type === "login") {
        if (Array.isArray(tinyCfg.discordScope)) {
            for (const item in tinyCfg.discordScope) {
                if (tinyScopeURI) {
                    tinyScopeURI += '%20';
                }
                tinyScopeURI += encodeURIComponent(tinyCfg.discordScope[item]);
            }
        }
    }

    // Webhook
    else if(type === "webhook") {
        tinyScopeURI += 'webhook.incoming';
    }

    // API URL
    const apiURL = require('../config.json').url;

    // Redirect URL
    return `${apiURL}oauth2/authorize?client_id=${encodeURIComponent(tinyCfg.client_id)}&scope=${tinyScopeURI}&response_type=code&redirect_uri=${tinyRedirect}&state=${tinyState}`;

};