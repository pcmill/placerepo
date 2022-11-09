import pg from 'pg';
const pool = new pg.Pool();

export default async function query(q) {
    const res = await pool.query(q);
    return res.rows;
}