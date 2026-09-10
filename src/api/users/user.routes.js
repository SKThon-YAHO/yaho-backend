import express from 'express';
import verifyToken from '../../middlewares/authMiddleware.js';
import * as userController from './user.controller.js';

const router = express.Router();

/**
 * @api-docgen
 * @tag Users
 * @summary Get user's information by local_code
 * @res 200 { success: true, data: { local_code: string, num_toilet: string, role: string } }
 * @res 404 LOCAL_CODE_NOT_FOUND
 */
router.get('/me', verifyToken, userController.getMyProfile);

/**
 * @api-docgen
 * @tag Users
 * @summary Get dashboard stats for manager's toilets (cleaning-needed badges)
 * @res 200 { success: true, data: [{ toilet_code, name, locate, total_count, dirty_count, supply_count, needsCleaning }] }
 */
router.get('/dashboard', verifyToken, userController.getDashboard);

/**
 * @api-docgen
 * @tag Users
 * @summary Get list of toilets managed by this local_code
 * @res 200 { success: true, data: [{ toilet_code, name, locate, urinal_count, stall_count, status, last_cleaning }] }
 */
router.get('/toilets', verifyToken, userController.getMyToilets);

/**
 * @api-docgen
 * @tag Users
 * @summary Get visit count per toilet for a given period
 * @req query { period: "day" | "week" | "month" } (기본값 day)
 * @res 200 { success: true, data: [{ toilet_code, name, visit_count }] }
 */
router.get('/toilets/usage', verifyToken, userController.getUsage);

/**
 * @api-docgen
 * @tag Users
 * @summary Add a cleaning log entry for one of the manager's toilets
 * @req body { cleaning_type: number }
 * @res 201 { success: true, data: { id, local_code, toilet_code, cleaning_type, created_at } }
 * @res 403 NO_PERMISSION
 */
router.post('/toilets/:toiletCode/cleaning', verifyToken, userController.addCleaningLog);

export default router;