import winston from 'winston';

const { combine, timestamp, printf, colorize } = winston.format;

const logFormat = printf(({ level, message, timestamp }) => {
    return `[${timestamp}] ${level}: ${message}`;
});

const logger = winston.createLogger({
    level: 'info',
    format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        logFormat
    ),
    transports: [
        // Save all logs (info and above) to combined.log
        new winston.transports.File({ filename: 'logs/combined.log' }),
        // Save only error logs to error.log
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    ],
});

// Add console output for development environment
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: combine(
            colorize(),
            logFormat
        )
    }));
}

export default logger;