import pool from '../../config/database.js';

const findByLocalCode = async (local_code) => {
    const query = 'SELECT local_code, num_toilet, password, role FROM users WHERE local_code = $1';
    const { rows } = await pool.query(query, [local_code]);
    return rows[0];
}

export { 
    findByLocalCode,
};