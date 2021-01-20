module.exports = function (access_token) {
    return new Promise(function (resolve, reject) {

        // Response
        require('@tinypudding/puddy-lib/http/fetch/text')(`https://discord.com/api/oauth2/token/revoke?token=${access_token}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        })
            .then(data => { resolve(data); }).catch(err => { reject(err); });

        // Complete
        return;

    });
};