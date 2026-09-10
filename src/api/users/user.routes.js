import express from 'express';
import verifyToken from '../../middlewares/authMiddleware.js';
import * as userController from './user.controller.js';

const router = express.Router();

/**
 * @api-docgen
 * @tag Users
 * @summary Get user's information by id 
 * @res 200 { success: true, data: { local_code: string, num_toilet: string, role: string } }
 */
router.get('/me', verifyToken, userController.getMyProfile);

/**
 * @api-docgen
 * @tag Users
 * @summary user's login
 * @req body { local_code: string, password: string }
 * @res 200 { success: true, data: { token: string } }
 * @res 400 MISSING_REQUIRED_FIELDS
 * @res 401 INVALID_CREDENTIALS
 * @res 403 ACCOUNT_DELETED
 */
router.post('/login', userController.login);

export default router;