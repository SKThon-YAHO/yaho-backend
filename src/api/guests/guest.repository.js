import pool from '../../config/database.js';

const IsValidUsage = async (toilet_code, uuid) => {
    const query = `
        SELECT EXISTS (
            SELECT 1
            FROM toilet_usage_log
            WHERE toilet_code = $1
              AND uuid = $2
              AND created_at >= NOW() - INTERVAL '30 minutes'
        ) AS exists
    `;

    const { rows } = await pool.query(query, [toilet_code, uuid]);

    return !rows[0].exists;
};

const LoggingUsage = async (toilet_code, uuid) => {
    const query = `
        INSERT INTO toilet_usage_log (toilet_code, uuid)
        VALUES ($1, $2)
    `;

    await pool.query(query, [toilet_code, uuid || null]);
}

const IsValidSurvey = async (toilet_code, uuid) => {
    const query = `
        SELECT EXISTS (
            SELECT 1
            FROM toilet_survey_log
            WHERE toilet_code = $1
              AND uuid = $2
              AND created_at >= NOW() - INTERVAL '30 minutes'
        ) AS exists
    `;

    const { rows } = await pool.query(query, [toilet_code, uuid]);

    return !rows[0].exists;
};

const IsValidDraw = async (uuid) => {
    const query = `
        SELECT EXISTS (
            SELECT 1
            FROM draw_log
            WHERE uuid = $1
              AND created_at >= NOW() - INTERVAL '1 day'
        ) AS exists
    `;

    const { rows } = await pool.query(query, [uuid]);

    return rows[0].exists;
}

const LoggingDrow = async (item, item_number, uuid) => {
    const query = `
        INSERT INTO draw_log (item, item_number, uuid)
        VALUES ($1, $2, $3)
    `;

    await pool.query(query, [item, item_number, uuid]);
}

const LoggingSurvey = async (toilet_code, survey, uuid) => {
    const query = `
        INSERT INTO toilet_survey_log (toilet_code, survey, uuid)
        VALUES ($1, $2::jsonb, $3)
    `;

    await pool.query(query, [toilet_code, JSON.stringify(survey ?? {}), uuid ?? null]);
}

export { 
    IsValidUsage,
    LoggingUsage,
    IsValidSurvey,
    LoggingSurvey,
    IsValidDraw,
    LoggingDrow
};