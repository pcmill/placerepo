import { getClient } from "../../database/connection.js";

async function updateAdminTranslation(req, res, next) {
    const client = await getClient();

    try {
        if (!req.body ||
            !req.body.name ||
            !req.body.language_code ||
            !req.body.translation_id) {
            throw({ message: 'Missing stuff', status: 400 });
        }

        await client.query('BEGIN');

        // check if the id exists
        const adminTranslation = await client.query(`SELECT * FROM admin_translation WHERE id = $1`, [req.body.translation_id]);

        if (!adminTranslation.rows) {
            throw({ message: 'This admin translation was not found!', status: 404 });
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
            UPDATE admin_translation
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

export default updateAdminTranslation;