import express from 'express';
import verifyToken from '../../middlewares/authMiddleware.js';
import * as userController from './user.controller.js';

const router = express.Router();

/**
 * @api-docgen
 * @tag Users
 * @summary Get user's information by id 
 * @res 200 { success: true, data: { id: number, nickname: string, status: string } }
 */
router.get('/me', verifyToken, userController.getMyProfile);

/**
 * @api-docgen
 * @tag Users
 * @summary Post user's information
 * @req body { name: string, email: string, nickname: string, password: string }
 * @res 201 { success: true, data: { id: number, nickname: string } }
 * @res 400 MISSING_REQUIRED_FIELDS
 * @res 409 DUPLICATED_EMAIL | DUPLICATED_NICKNAME
 */
router.post('/register', userController.registerUser);

/**
 * @api-docgen
 * @tag Users
 * @summary user's login
 * @req body { email: string, password: string }
 * @res 200 { success: true, data: { token: string } }
 * @res 400 MISSING_REQUIRED_FIELDS
 * @res 401 INVALID_CREDENTIALS
 * @res 403 ACCOUNT_INACTIVE
 */
router.post('/login', userController.login);

export default router;