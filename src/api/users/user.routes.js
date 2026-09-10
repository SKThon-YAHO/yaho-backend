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

export default router;