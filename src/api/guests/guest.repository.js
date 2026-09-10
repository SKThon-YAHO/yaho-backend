import pool from '../../config/database.js';

const IsValidUsage = async (toilet_code, uuid) => {
    const query = `
        SELECT EXISTS (
            SELECT 1
            FROM toilet_usage_log
            WHERE toilet_code = $1
              AND UUID = $2
              AND created_at >= NOW() - INTERVAL '30 minutes'
        ) AS exists
    `;

    const { rows } = await pool.query(query, [toilet_code, uuid]);

    return !rows[0].exists;
};

const LoggingUsage = async (toilet_code, uuid) => {
    const query = `
        INSERT INTO toilet_usage_log (toilet_code, UUID)
        VALUES ($1, $2)
    `;

    await pool.query(query, [toilet_code, uuid || NULL]);
}

const IsValidSurvey = async (toilet_code, uuid) => {
    const query = `
        SELECT EXISTS (
            SELECT 1
            FROM toilet_survey_log
            WHERE toilet_code = $1
              AND UUID = $2
              AND created_at >= NOW() - INTERVAL '30 minutes'
        ) AS exists
    `;

    const { rows } = await pool.query(query, [toilet_code, uuid]);

    return !rows[0].exists;
};

const LoggingSurvey = async (toilet_code, uuid) => {
    const query = `
        INSERT INTO toilet_survey_log (toilet_code, survey, UUID)
        VALUES ($1, $2, $3)
    `;

    await pool.query(query, [toilet_code, survey, uuid]);
}

export { 
    IsValidUsage,
    LoggingUsage,
    IsValidSurvey,
    LoggingSurvey
};