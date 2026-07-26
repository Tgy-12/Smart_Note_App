const morgan = require('morgan');
const logger = require('./logger');

const stream = {
    write: (message) => logger.info(message.trim()),
};

const morganMiddleWare = morgan(
    ':method :url :status :res[content-length] - :response-time ms',
    { stream }
);

module.exports = morganMiddleWare;

