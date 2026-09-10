import express from 'express';
import * as guestController from './guest.controller.js';

const router = express.Router();

/**
 * @api-docgen
 * @tag Guest
 * @summary 화장실 이용량 카운트, 로컬 스토리지에 저장된 UUID가 없다면 쿼리 비워서 보내고, 반환된 UUID를 로컬스토리지에 저장
 * @req query { toilet_code: string, UUID: string(nullable) }
 * @res 200 { success: true, data: { UUID: string } }
 * @res 400 MISSING_REQUIRED_FIELDS
 */
router.post('/usage', guestController.CountUpUsage);

/**
 * @api-docgen
 * @tag Guest
 * @summary 설문 라우트 survey는 아무것도 체크 안 함 -> 0, 청결도만 체크 -> 1, 비품만 체크 -> 2, 전부 체크 -> 3 으로 세팅
 * @req query { toilet_code: string, survey: int }
 * @res 200 { success: true }
 * @res 400 MISSING_REQUIRED_FIELDS
 */
router.post('/survey', guestController.InsertSurvey);

export default router;