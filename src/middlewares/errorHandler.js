import logger from '../utils/logger.js';

const errorHandler = (err, req, res, next) => {

    console.log('========== ERROR HANDLER ==========');
    console.log('Error:', err);
    console.log('Error Message:', err.message);
    console.log('Error Stack:', err.stack);
    console.log('Error Status:', err.status);
    console.log('Error Code:', err.code);

    console.log('---------- Request ----ㄴ------');
    console.log('Method:', req.method);
    console.log('URL:', req.originalUrl);
    console.log('Path:', req.path);
    console.log('Params:', req.params);
    console.log('Query:', req.query);
    console.log('Body:', req.body);
    console.log('Headers:', req.headers);

    console.log('===================================');

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