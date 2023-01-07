import { getClient } from "../../database/connection.js";
import { randomId } from "../../util/random.js";

async function addPlaceTranslation(req, res, next) {
    const client = await getClient();

    try {
        if (!req.body || !req.body.place_id || !req.body.name || !req.body.language_code) {
            throw({ message: 'Missing stuff', status: 400 });
        }

        const translationId = await randomId(12);

        await client.query('BEGIN');

        // check if the id exists
        const place = await client.query(`SELECT * FROM place WHERE id = $1`, [req.body.country_id]);

        if (!place.rows) {
            throw({ message: 'This place was not found!', status: 404 });
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

        await client.query(`
            INSERT INTO place_translation(id, name, language_code, created)
            VALUES($1, $2, $3, timezone('UTC', NOW()))`, [translationId, req.body.name, req.body.language_code]);

        await client.query(`
            INSERT INTO place_to_translation(place_id, translation_id)
            VALUES($1, $2)`, [req.body.place_id, translationId]);
        
        await client.query('COMMIT');

        res.status(201);
        res.send({
            translation_id: translationId
        });
    } catch (error) {
        await client.query('ROLLBACK');

        next(error);
    } finally {
        client.release();
    }
}

export default addPlaceTranslation;