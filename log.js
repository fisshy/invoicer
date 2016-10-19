const rollbar = require("rollbar");
const token = process.env.ROLLBAR;

const error = (err, env) => {
    if(!token) { return; }
    console.log('ERROR', err);
    rollbar.init(token, { environment : env });
    rollbar.reportMessage(err, "error");
}

const message = (msg, env) => {
    if(!token) { return; }
    console.log('MESSAGE', msg);
    rollbar.init(token, { environment : env });
    rollbar.reportMessage(msg);
}

module.exports = { error, message };
