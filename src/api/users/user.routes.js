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
 * @summary 메인 페이지에서 띄울 종합 정보들 (당일/당월 x 전체/화장실별 이용자 수)
 * @res 200 { success: true, data: { today: { total: number, toilets: [{toilet_code, name, count}] }, month: { total: number, toilets: [...] } } }
 */
router.get('/total', verifyToken, userController.getTotalData);

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

export default router;