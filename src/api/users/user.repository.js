import pool from '../../config/database.js';

const findByLocalCode = async (local_code) => {
    const query = 'SELECT local_code, num_toilet, password, role FROM local_manager WHERE local_code = $1 AND deleted_at IS NULL';
    const { rows } = await pool.query(query, [local_code]);
    return rows[0];
};

const getMyToilets = async (local_code) => {
    const query = `
        SELECT toilet_code, name, locate, urinal_count, stall_count, status, last_cleaning
        FROM toilets
        WHERE local_code = $1 AND deleted_at IS NULL
        ORDER BY name;
    `;
    const { rows } = await pool.query(query, [local_code]);
    return rows;
};

// 방문(QR 스캔) 횟수 집계 — period: 'day' | 'week' | 'month'
const PERIOD_INTERVALS = {
    day: '1 day',
    week: '7 days',
    month: '30 days',
};

const getUsage = async (local_code, period) => {
    const interval = PERIOD_INTERVALS[period]; // 화이트리스트 값만 통과하므로 SQL 인젝션 위험 없음
    if (!interval) {
        const error = new Error(`잘못된 period 값입니다. (허용값: ${Object.keys(PERIOD_INTERVALS).join(', ')})`);
        error.status = 400;
        throw error;
    }
    const query = `
        SELECT t.toilet_code, t.name, COUNT(u.id) AS visit_count
        FROM toilets t
        LEFT JOIN toilet_usage_log u
            ON u.toilet_code = t.toilet_code
            AND u.created_at >= now() - INTERVAL '${interval}'
        WHERE t.local_code = $1 AND t.deleted_at IS NULL
        GROUP BY t.toilet_code, t.name
        ORDER BY visit_count DESC;
    `;
    const { rows } = await pool.query(query, [local_code]);
    return rows;
};

export {
    findByLocalCode,
    getMyToilets,
    getUsage,
};