import { getClient } from "../../database/connection.js";
import { randomId } from "../../util/random.js";

async function addCountry(req, res, next) {
    const client = await getClient();

    try {
        if (!req.body || !req.body.continent_id || !req.body.name || !req.body.country_code || !req.body.language_code) {
            throw({ message: 'Missing stuff', status: 400 });
        }

        const countryId = await randomId(4);
        const translationId = await randomId(12);

        await client.query('BEGIN');

        // check if the id exists
        const continent = await client.query(`SELECT * FROM continent WHERE id = $1`, [req.body.continent_id]);

        if (!continent.rows) {
            throw({ message: 'This continent was not found!', status: 404 });
        }

        const country = await client.query(`
            INSERT INTO country(id, country_code, continent_id, created)
            VALUES($1, $2, $3, NOW())
            RETURNING *`, [countryId, req.body.country_code, req.body.continent_id]);
        
        const translation = await client.query(`
            INSERT INTO country_translation(id, name, language_code, country_id, created)
            VALUES($1, $2, $3, $4, NOW())
            RETURNING *`, [translationId, req.body.name, req.body.language_code, country.rows[0].id]);

        await client.query(`
            UPDATE country
            SET default_translation = $1
            WHERE id = $2`, [translation.rows[0].id, country.rows[0].id]);

        await client.query('COMMIT');

        res.status(201);
        res.send({
            message: 'Done!'
        });
    } catch (error) {
        await client.query('ROLLBACK');

        next(error);
    } finally {
        client.release();
    }
}

export default addCountry;