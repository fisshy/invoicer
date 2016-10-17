'use strict';

const Hapi = require('hapi');
const invoicer = require('./index');

// Create a server with a host and port
const server = new Hapi.Server();
server.connection({
    host: 'localhost',
    port: process.env.PORT || 8082
});

// Add the route
server.route({
    method: 'POST',
    path:'/invoice/s3',
    handler: function (request, reply) {
        let payload = request.payload;
        invoicer.uploadS3(payload.template, payload,
            (error, s3Url) => {
                if(error) {
                    return reply({ success: false });
                }
                return reply({ success: true, url: s3Url });
        });
    }
});


server.start((err) => {

    if (err) {
        throw err;
    }
    console.log('Server running at:', server.info.uri);

});
