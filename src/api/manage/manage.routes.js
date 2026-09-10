import express from 'express';
import verifyToken from '../../middlewares/authMiddleware.js';
import * as manageController from './manage.controller.js';

const router = express.Router();

/**
 * @api-docgen
 * @tag Manage
 * @summary Add a cleaning log entry for one of the manager's toilets
 * @req body { cleaning_type: number }
 * @res 200 { success: true }
 * @res 400 MISSING_REQUIRED_FIELDS
 * @res 401
 * @res 403 NO_PERMISSION
 */
router.post('/:toilet_code/cleaning', verifyToken, manageController.addCleaningLog);

export default router;