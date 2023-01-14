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
                a.id AS "admin_1_id",
                at."name" AS "admin_1_name",
                
                a2.id AS "admin_2_id",
                at2."name" AS "admin_2_name",

                a3.id AS "admin_3_id",
                at3."name" AS "admin_3_name",

                a4.id AS "admin_4_id",
                at4."name" AS "admin_4_name"
            FROM place AS p
            LEFT JOIN admin AS a ON a.id = p.admin_id
            LEFT JOIN admin_translation AS at ON at.id = a.default_translation
            
            LEFT JOIN admin AS a2 ON a2.id = a.admin_id
            LEFT JOIN admin_translation AS at2 ON at2.id = a2.default_translation

            LEFT JOIN admin AS a3 ON a3.id = a2.admin_id
            LEFT JOIN admin_translation AS at3 ON at3.id = a3.default_translation

            LEFT JOIN admin AS a4 ON a4.id = a3.admin_id
            LEFT JOIN admin_translation AS at4 ON at4.id = a4.default_translation
            WHERE p.id = $1
        `, [req.params.id]);

        const country = await client.query(`
            SELECT c.id, ct.name FROM country AS c
            INNER JOIN country_translation AS ct ON ct.id = c.default_translation
            WHERE c.id = $1`, [place.rows[0].country_id]);

        const translations = await client.query(`
            SELECT pt.id, pt.name, pt.created, pt.updated, pt.language_code, l.description AS "language"
            FROM place_translation AS pt
            INNER JOIN place_to_translation AS ptt ON ptt.translation_id = pt.id
            LEFT JOIN language AS l ON l.language_code = pt.language_code
            WHERE ptt.place_id = $1
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