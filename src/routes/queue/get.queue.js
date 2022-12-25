import { getClient } from "../../database/connection.js";

async function getQueue(req, res, next) {
    const client = await getClient();
    
    try {
        // check if the id exists
        const queue = await client.query(`
            SELECT q.id, q.request, q.created, q.request_type, c.github_user_name, c.github_avatar
            FROM queue AS q
            INNER JOIN contributor AS c ON c.github_user_id = q.user_id
            WHERE status = $1
        `, [0]);

        res.status(200);
        res.send([
            ...queue.rows
        ]);
    } catch (error) {
        next(error);
    } finally {
        client.release();
    }
}

export default getQueue;