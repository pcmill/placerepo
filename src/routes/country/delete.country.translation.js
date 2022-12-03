import { getClient } from "../../database/connection.js";

async function removeCountryTranslation(req, res, next) {
    const client = await getClient();

    try {
        await client.query('BEGIN');

        // check if the id exists
        const countryTranslation = await client.query(`SELECT * FROM country_translation WHERE id = $1`, [req.params.id]);

        if (!countryTranslation.rows) {
            throw({ message: 'This country translation was not found!', status: 404 });
        }

        await client.query(`
            DELETE FROM country_to_translation
            WHERE translation_id = $1`, [req.params.id]);

        await client.query(`
            DELETE FROM country_translation
            WHERE id = $1`, [req.params.id]);

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

export default removeCountryTranslation;