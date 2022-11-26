import { getClient } from "../../database/connection.js";
import { randomId } from "../../util/random.js";

async function addAdminTranslation(req, res, next) {
    const client = await getClient();

    try {
        if (!req.body ||
            !req.body.admin_id ||
            !req.body.name ||
            !req.body.language_code) {
            throw({ message: 'Missing stuff', status: 400 });
        }

        const level = Number(req.params.level);

        if (![1, 2, 3, 4].includes(level)) {
            throw({ message: 'Not a valid level.', status: 400 });
        }

        const translationId = await randomId(12);

        await client.query('BEGIN');

        // check if the id exists
        const admin = await client.query(`SELECT * FROM admin${level} WHERE id = $1`, [req.body.admin_id]);

        if (!admin.rows) {
            throw({ message: 'This admin was not found!', status: 404 });
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
            INSERT INTO admin${level}_translation(id, name, language_code, admin${level}_id, created)
            VALUES($1, $2, $3, $4, NOW())`, [translationId, req.body.name, req.body.language_code, req.body.admin_id]);

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

export default addAdminTranslation;