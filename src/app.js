import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

import errorHandler from './middlewares/errorHandler.js';

// Import routers
import authRouter from './api/auth/auth.routes.js';
import usersRouter from './api/users/user.routes.js';
import guestsRouter from './api/guests/guest.routes.js';
import manageRouter from './api/manage/manage.routes.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 8080;

// CORS configuration
const corsOptions = {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Parse JSON payloads
app.use(express.json());

// Setup routers
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/guest', guestsRouter);
app.use('/api/manage', manageRouter);

/**
 * @api-docgen
 * @tag System
 * @summary Serve API documentation HTML
 * @res 200 { type: text/html }
 */
app.get('/api-docs', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'api-docs.html'));
});

/**
 * @api-docgen
 * @tag System
 * @summary Check server status
 * @res 200 { status: string }
 */
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

app.use(errorHandler);

// Start server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});