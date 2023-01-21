import { getClient } from "../../database/connection.js";

async function getDownload(req, res, next) {
    const client = await getClient();
    
    try {
        const download = await client.query(`
            SELECT * 
            FROM download
            ORDER BY created DESC
            LIMIT 2`);

        res.status(200);
        res.set('Cache-contol', 'public, max-age=3600');
        res.send([
            ...download.rows
        ]);
    } catch (error) {
        next(error);
    } finally {
        client.release();
    }
}

export default getDownload;