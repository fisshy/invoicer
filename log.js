const rollbar = require("rollbar");
const token = process.env.ROLLBAR;

const error = (err, env) => {
    console.log('ERROR', err);
    rollbar.init(token, { environment : env });
    rollbar.reportMessage(err, "error");
}

const message = (msg, env) => {
    console.log('MESSAGE', msg);
    rollbar.init(token, { environment : env });
    rollbar.reportMessage(msg);
}

module.exports = { error, message };
