import pool from '../../config/database.js';

const findById = async (id) => {
    const query = 'SELECT id, nickname, status FROM users WHERE id = $1';
    const { rows } = await pool.query(query, [id]);
    return rows[0];
};

const findByEmail = async (email) => {
    const query = 'SELECT id, password, status FROM users WHERE email = $1';
    const { rows } = await pool.query(query, [email]);
    return rows[0];
};

const findByNickname = async (nickname) => {
    const query = 'SELECT id FROM users WHERE nickname = $1';
    const { rows } = await pool.query(query, [nickname]);
    return rows[0];
};

const insert = async (name, email, nickname, hashedPassword) => {
    // Return inserted id using RETURNING clause
    const query = 'INSERT INTO users (name, email, nickname, password) VALUES ($1, $2, $3, $4) RETURNING id';
    const { rows } = await pool.query(query, [name, email, nickname, hashedPassword]);
    return rows[0].id;
};

const updateLastLogin = async (id) => {
    const query = 'UPDATE users SET last_login = NOW() WHERE id = $1';
    await pool.query(query, [id]);
};

export { 
    findById, 
    findByEmail, 
    findByNickname, 
    insert, 
    updateLastLogin 
};