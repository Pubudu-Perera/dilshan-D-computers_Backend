const {logEvents} = require('./logger');

const handleError = (err, req, res, next) => {
    logEvents(`${err.name} : ${err.message}\t${req.method}\t${req.url}\t${req.header.origin}`, 'errorLogs.log');

    console.error(err.stack);

    const status = res.statusCode ? res.statusCode : 500; //server error

    res.status(status);

    res.json({message : err.message, isError : true});

    next();
}


module.exports = {handleError}