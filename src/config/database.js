import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;

// Connection pool configuration for Supabase
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    },
    max: 10,
    idleTimeoutMillis: 30000
});

export default pool;