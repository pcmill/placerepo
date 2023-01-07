import { getClient } from "../../database/connection.js";

async function updateCountryTranslation(req, res, next) {
    const client = await getClient();

    try {
        if (!req.body || !req.body.name || !req.body.translation_id) {
            throw({ message: 'Missing stuff', status: 400 });
        }

        await client.query('BEGIN');

        // check if the id exists
        const countryTranslation = await client.query(`SELECT * FROM country_translation WHERE id = $1`, [req.body.translation_id]);

        if (!countryTranslation.rows) {
            throw({ message: 'This country translation was not found!', status: 404 });
        }

        if (req.body.name.length > 128) {
            throw({ message: 'Name can be no longer than 128 characters.', status: 400 });
        }

        await client.query(`
            UPDATE country_translation
            SET name = $1, updated = timezone('UTC', NOW())
            WHERE id = $2`, [req.body.name, req.body.translation_id]);

        await client.query('COMMIT');

        res.status(200);
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

export default updateCountryTranslation;