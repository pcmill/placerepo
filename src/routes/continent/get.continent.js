import { getClient } from "../../database/connection.js";

async function getContinent(req, res, next) {
    try {
        const client = await getClient();

        // check if the id exists
        const continent = await client.query(`SELECT * FROM continent WHERE id = $1`, [req.params.id]);

        if (!continent.rows.length) {
            throw({ message: 'This continent was not found!', status: 404 });
        }

        const translations = await client.query(`SELECT id, name, created, updated, language_code FROM continent_translation WHERE continent_id = $1`, [req.params.id]);

        res.status(200);
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