import { getClient } from "../../database/connection.js";

async function getQueue(req, res, next) {
    const client = await getClient();
    
    try {
        // check if the id exists
        const queue = await client.query(`
            SELECT 
                q.id,
                q.request,
                q.created,
                q.request_type,
                c.github_user_name,
                c.github_avatar,
                pt.name AS place_name,
                l.description AS language,
                adt.name AS admin_name,
                ct.name AS country_name,
                contt.name AS continent_name,
                row_to_json(p) AS place,
                row_to_json(cont) AS continent,
                row_to_json(co) AS country,
                row_to_json(a) AS admin
            FROM queue AS q
            INNER JOIN contributor AS c ON c.github_user_id = q.user_id
            LEFT JOIN language AS l ON q.request ->> 'language_code' = l.language_code
            LEFT JOIN place AS p ON p.id = q.request ->> 'place_id'
            LEFT JOIN place_translation AS pt ON pt.id = p.default_translation
            LEFT JOIN admin AS a ON a.id = q.request ->> 'admin_id'
            LEFT JOIN admin_translation AS adt ON adt.id = a.default_translation
            LEFT JOIN country AS co ON co.id = q.request ->> 'country_id'
            LEFT JOIN country_translation AS ct ON ct.id = co.default_translation
            LEFT JOIN continent AS cont ON cont.id = q.request ->> 'continent_id'
            LEFT JOIN continent_translation AS contt ON contt.id = cont.default_translation
            WHERE status = $1
            ORDER BY q.created ASC
            LIMIT 20
        `, [0]);

        res.status(200);
        res.set('Cache-contol', 'public, max-age=30');
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