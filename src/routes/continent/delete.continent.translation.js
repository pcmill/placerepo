import { getClient } from "../../database/connection.js";

async function removeContinentTranslation(req, res, next) {
    const client = await getClient();

    try {
        await client.query('BEGIN');

        // check if the id exists
        const continentTranslation = await client.query(`SELECT * FROM continent_translation WHERE id = $1`, [req.params.id]);

        if (!continentTranslation.rows) {
            throw({ message: 'This continent translation was not found!', status: 404 });
        }

        await client.query(`
            DELETE FROM continent_to_translation
            WHERE translation_id = $1`, [req.params.id]);

        await client.query(`
            DELETE FROM continent_translation
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

export default removeContinentTranslation;