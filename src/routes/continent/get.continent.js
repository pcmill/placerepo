import { getClient } from "../../database/connection.js";

async function getContinent(req, res, next) {
    const client = await getClient();
    
    try {
        // check if the id exists
        const continent = await client.query(`SELECT * FROM continent WHERE id = $1`, [req.params.id]);

        if (!continent.rows.length) {
            throw({ message: 'This continent was not found!', status: 404 });
        }

        const translations = await client.query(`
            SELECT ct.id, ct.name, ct.created, ct.updated, ct.language_code, l.description AS "language"
            FROM continent_translation AS ct
            INNER JOIN continent_to_translation AS ctt ON ct.id = ctt.translation_id
            LEFT JOIN language AS l ON l.language_code = ct.language_code
            WHERE ctt.continent_id = $1
        `, [req.params.id]);

        res.status(200);
        res.set('Cache-contol', 'public, max-age=60');
        res.send({
            ...continent.rows[0],
            translations: translations.rows
        });
    } catch (error) {
        next(error);
    } finally {
        client.release();
    }
}

export default getContinent;