import { getClient } from "../../database/connection.js";

async function getDownload(req, res, next) {
    const client = await getClient();
    
    try {
        const download_csv = await client.query(`
            SELECT * 
            FROM download
            WHERE type = 0
            ORDER BY created DESC
            LIMIT 1`);

        const download_sql = await client.query(`
            SELECT * 
            FROM download
            WHERE type = 1
            ORDER BY created DESC
            LIMIT 1`);

        res.status(200);
        res.set('Cache-contol', 'public, max-age=3600');
        res.send([
            ...download_csv.rows,
            ...download_sql.rows
        ]);
    } catch (error) {
        next(error);
    } finally {
        client.release();
    }
}

export default getDownload;