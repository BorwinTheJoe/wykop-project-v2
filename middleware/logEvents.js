// date-fns for date handling. uuid for unique IDs.
const {format} = require('date-fns');
const {v4: uuid} = require('uuid');

// fs for writing and reading files. fsPromises needed to write correctly when actions take time. path to write files to correct folders and namespaces.
const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');

const logEvents = async (message, logName) => {
    // Date and time of the created log event. And log item that is the Date, it's unique ID, and message of said event.
    const dateTime = `${format(new Date(), 'yyyy/MM/dd\tHH:mm:ss')}`;
    const logItem = `${dateTime}\t${uuid()}\t${message}\n`;

    try {
        //If the logs directory doesn't exist, create one.
        if (!fs.existsSync(path.join(__dirname, '..', 'logs'))) {
            await fsPromises.mkdir(path.join(__dirname, '..', 'logs'));
        }
        // append to a file with the provided log name inside the logs directory the LogItem
        await fsPromises.appendFile(path.join(__dirname, '..', 'logs', logName), logItem);
    }

    // if there's an error, catch it and send it to console.
    catch (err) {
        console.log(err);
    }
}

const reqlogger = (req, res, next) => {
    //log an Event, with the message containing tabulated request method, origin, and the requested url, with the destination log file being the "reqLog.txt" file.
    logEvents(`${req.method}\t${req.headers.origin}\t${req.url}`, `reqLog.txt`);
    // write to console the request's method and the request's path.
    console.log(`${req.method} ${req.path}`);
    next(); //perform the next function.
}

// console.log(uuid() + `\t` + format(new Date(), 'yyyy-MM-dd\tHH:mm:ss') + '\n');

// Export the logger and logEvents methods.
module.exports = {reqlogger, logEvents};