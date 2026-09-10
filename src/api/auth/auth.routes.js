import express from 'express';
import * as authController from './auth.controller.js';

const router = express.Router();

/**
 * @api-docgen
 * @tag Auth
 * @summary user's login
 * @req body { local_code: string, password: string }
 * @res 200 { success: true, data: { token: string } }
 * @res 400 MISSING_REQUIRED_FIELDS
 * @res 401 INVALID_CREDENTIALS
 * @res 403 ACCOUNT_DELETED
 */
router.post('/login', authController.login);

export default router;