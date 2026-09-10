import pool from '../../config/database.js';

// 소유 확인 후 청소기록 추가 + toilets.last_cleaning 갱신 (다른 관리자의 화장실에 기록 남기는 것 방지)
const addCleaningLog = async (local_code, toilet_code, cleaning_type) => {
    const ownerCheck = await pool.query(
        'SELECT 1 FROM toilets WHERE toilet_code = $1 AND local_code = $2 AND deleted_at IS NULL',
        [toilet_code, local_code]
    );
    if (ownerCheck.rows.length === 0) {
        const error = new Error('No permission to this toilet');
        error.status = 403;
        error.code = 'NO_PERMISSION';
        throw error;
    }

    const insertQuery = `
        INSERT INTO toilet_cleaning_log (local_code, toilet_code, cleaning_type)
        VALUES ($1, $2, $3)
    `;
    await pool.query(insertQuery, [local_code, toilet_code, cleaning_type]);

    // 청소 완료 시점을 toilets.last_cleaning에 반영 — 이걸 기준으로 다음번 대시보드 집계가 리셋됨
    await pool.query('UPDATE toilets SET last_cleaning = now() WHERE toilet_code = $1', [toilet_code]);
};

export {
    addCleaningLog,
};