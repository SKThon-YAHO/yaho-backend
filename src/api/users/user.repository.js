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
// 당일/당월 x 전체/화장실별 이용자 수를 한 번에 집계 (메인 페이지 종합 정보용, 관리자 소속과 무관하게 전체 화장실 기준)
const getUsageSummary = async () => {
    const query = `
        SELECT
            t.toilet_code,
            t.name,
            COUNT(u.id) FILTER (WHERE u.created_at >= CURRENT_DATE) AS today_count,
            COUNT(u.id) FILTER (WHERE u.created_at >= date_trunc('month', CURRENT_DATE)) AS month_count
        FROM toilets t
        LEFT JOIN toilet_usage_log u ON u.toilet_code = t.toilet_code
        WHERE t.deleted_at IS NULL
        GROUP BY t.toilet_code, t.name
        ORDER BY t.name;
    `;
    const { rows } = await pool.query(query);

    const perToilet = rows.map((row) => ({
        toilet_code: row.toilet_code,
        name: row.name,
        today_count: Number(row.today_count),
        month_count: Number(row.month_count),
    }));

    const todayTotal = perToilet.reduce((sum, t) => sum + t.today_count, 0);
    const monthTotal = perToilet.reduce((sum, t) => sum + t.month_count, 0);

    return {
        today: { total: todayTotal, toilets: perToilet.map(({ toilet_code, name, today_count }) => ({ toilet_code, name, count: today_count })) },
        month: { total: monthTotal, toilets: perToilet.map(({ toilet_code, name, month_count }) => ({ toilet_code, name, count: month_count })) },
    };
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
    getUsageSummary,
};