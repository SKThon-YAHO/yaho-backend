import pool from '../../config/database.js';

const IsValid = async (toilet_code, UUID) => {
    const query = `
        SELECT EXISTS (
            SELECT 1
            FROM toilet_usage_log
            WHERE toilet_code = $1
              AND UUID = $2
              AND created_at >= NOW() - INTERVAL '30 minutes'
        ) AS exists
    `;

    const { rows } = await pool.query(query, [toilet_code, UUID]);

    return !rows[0].exists;
};

const CountUpUsage = async (toilet_code) => {
    const query = 'UPDATE toilets SET toilet_usage = toilet_usage + 1 WHERE toilet_code = $1';
    await pool.query(query, [toilet_code]);
}

export { 
    IsValid,
    CountUpUsage,
};