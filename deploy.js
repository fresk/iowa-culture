var shell = require('shelljs');
var client = require('phonegap-build-api');

var auth = { 
    username: process.env.PHONEGAP_USER, 
    password: process.env.PHONEGAP_PASSWORD 
};



shell.cp("phonegap/*", "dist");
shell.exec("zip -r dist dist");

client.auth(auth, function(e, api) {
    var options = {
        form: {
            data: {
                debug: true
            },
            file: './dist.zip'
        }
    };
    api.put('/apps/882278', options, function(e, data) {
        console.log('error:', e);
        console.log('data:', data);
    });
});



