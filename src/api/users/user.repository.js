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
// 당일/당월 x 전체/화장실별 이용자 수를 한 번에 집계 (local_code로 관리하는 화장실만)
const getUsageSummary = async (local_code) => {
    const query = `
        SELECT
            t.toilet_code,
            t.name,
            COUNT(u.id) FILTER (WHERE u.created_at >= CURRENT_DATE) AS today_count,
            COUNT(u.id) FILTER (WHERE u.created_at >= date_trunc('month', CURRENT_DATE)) AS month_count
        FROM toilets t
        LEFT JOIN toilet_usage_log u ON u.toilet_code = t.toilet_code
        WHERE t.local_code = $1 AND t.deleted_at IS NULL
        GROUP BY t.toilet_code, t.name
        ORDER BY t.name;
    `;
    const { rows } = await pool.query(query, [local_code]);

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

// 이번 달 설문 응답에서 항목별 불만족(true) 개수 집계 (local_code로 관리하는 화장실만)
const getMonthlySurveyStats = async (local_code) => {
    const query = `
        SELECT
            COUNT(*) FILTER (WHERE (s.survey->'clean'->>'toilet')::boolean) AS clean_toilet,
            COUNT(*) FILTER (WHERE (s.survey->'clean'->>'urinal')::boolean) AS clean_urinal,
            COUNT(*) FILTER (WHERE (s.survey->'clean'->>'sink')::boolean) AS clean_sink,
            COUNT(*) FILTER (WHERE (s.survey->'clean'->>'floor')::boolean) AS clean_floor,
            COUNT(*) FILTER (WHERE (s.survey->'break'->>'toilet')::boolean) AS break_toilet,
            COUNT(*) FILTER (WHERE (s.survey->'break'->>'urinal')::boolean) AS break_urinal,
            COUNT(*) FILTER (WHERE (s.survey->'break'->>'sink')::boolean) AS break_sink,
            COUNT(*) FILTER (WHERE (s.survey->'break'->>'door')::boolean) AS break_door,
            COUNT(*) FILTER (WHERE (s.survey->'item'->>'soap')::boolean) AS item_soap,
            COUNT(*) FILTER (WHERE (s.survey->'item'->>'paper')::boolean) AS item_paper
        FROM toilet_survey_log s
        JOIN toilets t ON t.toilet_code = s.toilet_code
        WHERE t.local_code = $1
          AND s.created_at >= date_trunc('month', CURRENT_DATE);
    `;
    const { rows } = await pool.query(query, [local_code]);
    const r = rows[0];

    return {
        clean: {
            toilet: Number(r.clean_toilet),
            urinal: Number(r.clean_urinal),
            sink: Number(r.clean_sink),
            floor: Number(r.clean_floor),
        },
        break: {
            toilet: Number(r.break_toilet),
            urinal: Number(r.break_urinal),
            sink: Number(r.break_sink),
            door: Number(r.break_door),
        },
        item: {
            soap: Number(r.item_soap),
            paper: Number(r.item_paper),
        },
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
    getMonthlySurveyStats,
};