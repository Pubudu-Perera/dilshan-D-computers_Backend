const { format } = require('date-fns');
const {v4: uuid} = require('uuid');
const path = require('path');
const fs = require('fs');
const fsPromises = require('fs').promises;


const logEvents = async (message, logFileName) => {
    const dateTime = format(new Date(), 'yyyy-MM-dd\tHH:mm:ss');
    const logItem = `${dateTime}\t${uuid()}\t${message}\n`;

    try {
        if (!fs.existsSync(path.join(__dirname,'..','logs'))) {
            await fsPromises.mkdir(path.join(__dirname,'..','logs'));
        }

        await fsPromises.appendFile(path.join(__dirname,'..','logs',logFileName), logItem);
    } catch (error) {
        console.error(error);
    }
}

const logger = (req,res,next) => {
    logEvents(`${req.method}\t${req.url}\t${req.header.origin}`, 'reqLogs.log');
    console.log(`${req.method}\t${req.url}`);
    next();
}


module.exports = {logEvents, logger}