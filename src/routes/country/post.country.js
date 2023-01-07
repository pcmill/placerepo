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

        const country_code = await client.query(`SELECT * FROM country WHERE country_code = UPPER($1)`, [req.body.country_code]);

        if (country_code.rows.length > 0) {
            throw({ message: 'This country code was already used', status: 404 });
        }

        if (req.body.language_code.length < 2) {
            throw({ message: 'Language code should be at least 2 characters.', status: 400 });
        }

        if (req.body.language_code.length > 5) {
            throw({ message: 'Language code can be no longer than 5 characters.', status: 400 });
        }

        if (req.body.name.length > 128) {
            throw({ message: 'Name can be no longer than 128 characters.', status: 400 });
        }

        if (req.body.country_code.length !== 2) {
            throw({ message: 'Country code has to be 2 characters long.', status: 400 });
        }

        await client.query(`
            INSERT INTO country_translation(id, name, language_code, created)
            VALUES($1, $2, $3, timezone('UTC', NOW()))`, [translationId, req.body.name, req.body.language_code]);

        await client.query(`
            INSERT INTO country(id, default_translation, country_code, continent_id, created)
            VALUES($1,  $2, UPPER($3), $4, timezone('UTC', NOW()))`, [countryId, translationId, req.body.country_code, req.body.continent_id]);

        await client.query(`
            INSERT INTO country_to_translation(country_id, translation_id)
            VALUES($1, $2`, [req.body.country_id, translationId]);

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