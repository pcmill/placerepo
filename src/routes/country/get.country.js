import { getClient } from "../../database/connection.js";

async function getCountry(req, res, next) {
    const client = await getClient();
    
    try {
        // check if the id exists
        const country = await client.query(`SELECT * FROM country WHERE id = $1`, [req.params.id]);

        if (!country.rows.length) {
            throw({ message: 'This country was not found!', status: 404 });
        }

        const continent = await client.query(`
            SELECT c.id, ct.name FROM continent AS c
            INNER JOIN continent_translation AS ct ON ct.id = c.default_translation
            WHERE c.id = $1`, [country.rows[0].continent_id]);

        const translations = await client.query(`SELECT id, name, created, updated, language_code FROM country_translation WHERE country_id = $1`, [req.params.id]);

        res.status(200);
        res.send({
            ...country.rows[0],
            continent_name: continent.rows[0].name,
            translations: translations.rows
        });
    } catch (error) {
        next(error);
    } finally {
        client.release();
    }
}

export default getCountry;