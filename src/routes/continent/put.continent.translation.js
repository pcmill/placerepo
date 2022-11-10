import { getClient } from "../../database/connection.js";

async function updateContinentTranslation(req, res, next) {
    const client = await getClient();

    try {
        if (!req.body || !req.body.name || !req.body.language_code || !req.body.translation_id) {
            throw({ message: 'Missing stuff', status: 400 });
        }

        await client.query('BEGIN');

        // check if the id exists
        const continentTranslation = await client.query(`SELECT * FROM continent_translation WHERE id = $1`, [req.body.translation_id]);

        if (!continentTranslation.rows) {
            throw({ message: 'This continent translation was not found!', status: 404 });
        }

        await client.query(`
            UPDATE continent_translation
            SET name = $1, language_code = $2, updated = NOW()
            WHERE id = $3`, [req.body.name, req.body.language_code, req.body.translation_id]);
        
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

export default updateContinentTranslation;