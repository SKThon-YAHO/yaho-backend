import logger from '../utils/logger.js';

const errorHandler = (err, req, res, next) => {
    const status = err.status || 500;
    const code = err.code || 'INTERNAL_SERVER_ERROR';

    logger.error(`[${req.method} ${req.originalUrl}] ${status} - ${code} : ${err.message}`);
    
    if (status >= 500 && err.stack) {
        logger.error(err.stack);
    }

    const responseMessage = status >= 500 
        ? 'Internal server error.' 
        : err.message;

    return res.status(status).json({
        success: false,
        error: { 
            code: code, 
            message: responseMessage 
        }
    });
};

export default errorHandler;