import jwt from 'jsonwebtoken';

const verifyToken = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            const error = new Error('Token is missing or invalid format.');
            error.status = 401;
            error.code = 'INVALID_TOKEN_FORMAT';
            throw error;
        }

        const token = authHeader.split(' ')[1];

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        req.user = decoded;

        next();

    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            error.status = 401;
            error.code = 'TOKEN_EXPIRED';
            error.message = 'Token has expired.';
        } else if (error.name === 'JsonWebTokenError') {
            error.status = 401;
            error.code = 'INVALID_TOKEN';
            error.message = 'Token signature is invalid.';
        } else {
            error.status = error.status || 401;
            error.code = error.code || 'AUTHENTICATION_FAILED';
        }

        next(error);
    }
};

export default verifyToken;