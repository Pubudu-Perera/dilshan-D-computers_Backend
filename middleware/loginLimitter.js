const {rateLimit} = require('express-rate-limit');
const {logEvents} = require('./logger');

const loginLimitter = rateLimit({

    windowMs : 60 * 1000, //1min

    max : 5, //limit each IP address to 5 login requests per 'window' per minute

    message : 
    {
        message : "Too many login attempts from this IP address, please try again after a 60 second pause"
    },
    handler : (req,res,next,options) => {
        logEvents(`Too many requests : ${options.message.message}\t${req.method}\t${req.url}\t${req.headers.origin}`, 'errLog.log');
        res.status(options.statusCode).send(options.message);
    },
    standardHeaders : true,
    legacyHeaders : false

});

module.exports = loginLimitter;