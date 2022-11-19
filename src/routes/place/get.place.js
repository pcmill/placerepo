import { getClient } from "../../database/connection.js";

async function getPlace(req, res, next) {
    const client = await getClient();
    
    try {
        // check if the id exists
        const place = await client.query(`SELECT * FROM place WHERE id = $1`, [req.params.id]);

        if (!place.rows.length) {
            throw({ message: 'This place was not found!', status: 404 });
        }

        const admins = await client.query(`
            SELECT 
                a1t."name" AS "admin1_name",
                a2t."name" AS "admin2_name",
                a3t."name" AS "admin3_name",
                a4t."name" AS "admin4_name"
            FROM place AS p
            INNER JOIN admin1 AS a1 ON a1.id = p.admin1
            INNER JOIN admin1_translation AS a1t ON a1t.id = a1.default_translation
            INNER JOIN admin2 AS a2 ON a2.id = p.admin2
            INNER JOIN admin2_translation AS a2t ON a2t.id = a2.default_translation
            LEFT JOIN admin3 AS a3 ON a3.id = p.admin3
            LEFT JOIN admin3_translation AS a3t ON a3t.id = a3.default_translation
            LEFT JOIN admin4 AS a4 ON a4.id = p.admin4
            LEFT JOIN admin4_translation AS a4t ON a4t.id = a4.default_translation
            WHERE p.id = $1
        `, [req.params.id]);

        const country = await client.query(`
            SELECT c.id, ct.name FROM country AS c
            INNER JOIN country_translation AS ct ON ct.id = c.default_translation
            WHERE c.id = $1`, [place.rows[0].country_id]);

        const translations = await client.query(`
            SELECT ct.id, ct.name, ct.created, ct.updated, ct.language_code, l.description AS "language"
            FROM place_translation AS ct
            LEFT JOIN language AS l ON l.language_code = ct.language_code
            WHERE place_id = $1
        `, [req.params.id]);

        res.status(200);
        res.send({
            ...place.rows[0],
            ...admins.rows[0],
            country_name: country.rows[0].name,
            translations: translations.rows
        });
    } catch (error) {
        next(error);
    } finally {
        client.release();
    }
}

export default getPlace;