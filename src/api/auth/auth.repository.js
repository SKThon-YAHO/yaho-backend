import pool from '../../config/database.js';

const findByLocalCode = async (local_code) => {
    const query = 'SELECT local_code, password, role, deleted_at FROM local_manager WHERE local_code = $1';
    const { rows } = await pool.query(query, [local_code]);
    return rows[0];
}

export { 
    findByLocalCode,
};