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
            COUNT(*) FILTER (WHERE (s.survey->'item'->>'paper')::boolean) AS item_paper,
            COUNT(*) FILTER (WHERE (s.survey->'item'->>'trash')::boolean) AS item_trash
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
            trash: Number(r.item_trash),

        },
    };
};

// 이번 달 설문 응답을 화장실별로 나눠서 항목별 불만족(true) 개수 집계 (local_code로 관리하는 화장실만)
const getSurvey = async (local_code) => {
    const query = `
        SELECT
            t.toilet_code,
            t.name,
            COUNT(*) FILTER (WHERE (s.survey->'clean'->>'toilet')::boolean) AS clean_toilet,
            COUNT(*) FILTER (WHERE (s.survey->'clean'->>'urinal')::boolean) AS clean_urinal,
            COUNT(*) FILTER (WHERE (s.survey->'clean'->>'sink')::boolean) AS clean_sink,
            COUNT(*) FILTER (WHERE (s.survey->'clean'->>'floor')::boolean) AS clean_floor,
            COUNT(*) FILTER (WHERE (s.survey->'break'->>'toilet')::boolean) AS break_toilet,
            COUNT(*) FILTER (WHERE (s.survey->'break'->>'urinal')::boolean) AS break_urinal,
            COUNT(*) FILTER (WHERE (s.survey->'break'->>'sink')::boolean) AS break_sink,
            COUNT(*) FILTER (WHERE (s.survey->'break'->>'door')::boolean) AS break_door,
            COUNT(*) FILTER (WHERE (s.survey->'item'->>'soap')::boolean) AS item_soap,
            COUNT(*) FILTER (WHERE (s.survey->'item'->>'paper')::boolean) AS item_paper,
            COUNT(*) FILTER (WHERE (s.survey->'item'->>'trash')::boolean) AS item_trash
        FROM toilets t
        LEFT JOIN toilet_survey_log s
            ON s.toilet_code = t.toilet_code
            AND s.created_at >= date_trunc('month', CURRENT_DATE)
        WHERE t.local_code = $1 AND t.deleted_at IS NULL
        GROUP BY t.toilet_code, t.name
        ORDER BY t.name;
    `;
    const { rows } = await pool.query(query, [local_code]);

    return rows.map((r) => ({
        toilet_code: r.toilet_code,
        name: r.name,
        survey: {
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
                trash: Number(r.item_trash),
            },
        },
    }));
};


const getUsage = async (local_code) => {
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

    return rows.map((row) => ({
        toilet_code: row.toilet_code,
        name: row.name,
        today_count: Number(row.today_count),
        month_count: Number(row.month_count),
    }));
};

const getRawLogsForInsight = async (local_code) => {
    const usageQuery = `
        SELECT t.toilet_code, t.name, u.created_at
        FROM toilet_usage_log u
        JOIN toilets t ON t.toilet_code = u.toilet_code
        WHERE t.local_code = $1
          AND u.created_at >= date_trunc('month', CURRENT_DATE)
        ORDER BY u.created_at DESC
        LIMIT 500;
    `;
    const surveyQuery = `
        SELECT t.toilet_code, t.name, s.survey, s.created_at
        FROM toilet_survey_log s
        JOIN toilets t ON t.toilet_code = s.toilet_code
        WHERE t.local_code = $1
          AND s.created_at >= date_trunc('month', CURRENT_DATE)
        ORDER BY s.created_at DESC
        LIMIT 500;
    `;

    const [usageResult, surveyResult] = await Promise.all([
        pool.query(usageQuery, [local_code]),
        pool.query(surveyQuery, [local_code]),
    ]);

    return {
        usageLogs: usageResult.rows, // [{ toilet_code, name, created_at }]
        surveyLogs: surveyResult.rows, // [{ toilet_code, name, survey, created_at }]
    };
};
export {
    findByLocalCode,
    getMyToilets,
    getUsage,
    getUsageSummary,
    getMonthlySurveyStats,
    getSurvey,
    getRawLogsForInsight
};