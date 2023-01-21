import { getClient } from "../../database/connection.js";

async function getAdmin(req, res, next) {
    const client = await getClient();
    
    try {
        // check if the id exists
        const admin = await client.query(`SELECT * FROM admin WHERE id = $1`, [req.params.id]);

        if (!admin.rows.length) {
            throw({ message: 'This admin was not found!', status: 404 });
        }

        const country = await client.query(`
            SELECT c.id, ct.name FROM country AS c
            INNER JOIN country_translation AS ct ON ct.id = c.default_translation
            WHERE c.id = $1`, [admin.rows[0].country_id]);

        const translations = await client.query(`
            SELECT at.id, at.name, at.created, at.updated, at.language_code, l.description AS "language"
            FROM admin_to_translation AS att
            INNER JOIN admin_translation AS at ON at.id = att.translation_id
            LEFT JOIN language AS l ON l.language_code = at.language_code
            WHERE att.admin_id = $1
        `, [req.params.id]);

        res.status(200);
        res.set('Cache-contol', 'public, max-age=60');
        res.send({
            ...admin.rows[0],
            country_name: country.rows[0].name,
            translations: translations.rows
        });
    } catch (error) {
        next(error);
    } finally {
        client.release();
    }
}

export default getAdmin;