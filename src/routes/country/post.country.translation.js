import { getClient } from "../../database/connection.js";
import { randomId } from "../../util/random.js";

async function addCountryTranslation(req, res, next) {
    const client = await getClient();

    try {
        if (!req.body || !req.body.country_id || !req.body.name || !req.body.language_code) {
            throw({ message: 'Missing stuff', status: 400 });
        }

        const translationId = await randomId(12);

        await client.query('BEGIN');

        // check if the id exists
        const country = await client.query(`SELECT * FROM country WHERE id = $1`, [req.body.country_id]);

        if (!country.rows) {
            throw({ message: 'This country was not found!', status: 404 });
        }

        await client.query(`
            INSERT INTO country_translation(id, name, language_code, country_id, created)
            VALUES($1, $2, $3, $4, NOW())`, [translationId, req.body.name, req.body.language_code, req.body.country_id]);

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

export default addCountryTranslation;