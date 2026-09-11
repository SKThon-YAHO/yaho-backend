import express from 'express';
import * as guestController from './guest.controller.js';

const router = express.Router();

/**
 * @api-docgen
 * @tag Guest
 * @summary 화장실 이용량 카운트, 로컬 스토리지에 저장된 uuid가 없다면 쿼리 비워서 보내고, 반환된 uuid를 로컬스토리지에 저장 및 다음 요청 때 붙여서
 * @req body { uuid: string(nullable) }
 * @res 200 { success: true, data: { uuid: string } }
 * @res 400 MISSING_REQUIRED_FIELDS
 */
router.post('/:toilet_code/usage', guestController.LoggingUsage);

/**
 * @api-docgen
 * @tag Guest
 * @summary 설문 라우트 각 품목별로 부족한 것이 true(체크한 것) 문제 없는 것이 false(체크 안 한 것)임
 * @req body { 
 * @req     survey: { 
 * @req         clean: { toilet: bool, urinal: bool, sink: bool, floor: bool },
 * @req         break: { toilet: bool, urinal: bool, sink: bool, door: bool },
 * @req         item: { soap: bool, paper: bool }
 * @req     },
 * @req uuid: string }
 * @res 200 { success: true }
 * @res 400 MISSING_REQUIRED_FIELDS
 */
router.post('/:toilet_code/survey', guestController.LoggingSurvey);

export default router;