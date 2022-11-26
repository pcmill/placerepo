import { getClient } from "../../database/connection.js";

async function getAdmin(req, res, next) {
    const client = await getClient();
    
    try {
        const level = Number(req.params.level);

        if (![1, 2, 3, 4].includes(level)) {
            throw({ message: 'Not a valid level.', status: 400 });
        }
        
        // check if the id exists
        const admin = await client.query(`SELECT * FROM admin${level} WHERE id = $1`, [req.params.id]);

        if (!admin.rows.length) {
            throw({ message: 'This admin was not found!', status: 404 });
        }

        const country = await client.query(`
            SELECT c.id, ct.name FROM country AS c
            INNER JOIN country_translation AS ct ON ct.id = c.default_translation
            WHERE c.id = $1`, [admin.rows[0].country_id]);

        const translations = await client.query(`
            SELECT ct.id, ct.name, ct.created, ct.updated, ct.language_code, l.description AS "language"
            FROM admin${level}_translation AS ct
            LEFT JOIN language AS l ON l.language_code = ct.language_code
            WHERE admin${level}_id = $1
        `, [req.params.id]);

        res.status(200);
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