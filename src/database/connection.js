import pg from 'pg';
const pool = new pg.Pool();

export async function getClient() {
    return await pool.connect();
}