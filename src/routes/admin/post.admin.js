import { getClient } from "../../database/connection.js";
import { checkLatLon } from "../../util/latlon.js";
import { randomId } from "../../util/random.js";

async function addAdmin(req, res, next) {
    const client = await getClient();

    try {
        if (!req.body ||
            !req.body.country_id || 
            !req.body.name ||
            !req.body.language_code) {
            throw({ message: 'Missing stuff', status: 400 });
        }

        const adminId = await randomId(6);
        const translationId = await randomId(12);

        await client.query('BEGIN');

        // check if the id exists
        const country = await client.query(`SELECT * FROM country WHERE id = $1`, [req.body.country_id]);

        if (!country.rows) {
            throw({ message: 'This country was not found!', status: 404 });
        }

        const {latitude, longitude} = checkLatLon(req.body.latitude, req.body.longitude);

        if (req.body.language_code.length < 2) {
            throw({ message: 'Language code should be at least 2 characters.', status: 400 });
        }

        if (req.body.language_code.length > 5) {
            throw({ message: 'Language code can be no longer than 5 characters.', status: 400 });
        }

        if (req.body.name.length === 0) {
            throw({ message: 'Name has be at least one character long.', status: 400 });
        }

        if (req.body.name.length > 128) {
            throw({ message: 'Name can be no longer than 128 characters.', status: 400 });
        }

        // Check if the admin exists.
        if (req.body.admin_id) {
            const adminAbove = await client.query(`SELECT * FROM admin WHERE id = $1`, [req.body.admin_id]);

            if (!adminAbove.rows) {
                throw({ message: 'This admin was not found!', status: 404 });
            }
        }

        await client.query(`
            INSERT INTO admin${level}(id, country_id, latitude, longitude, admin_id, created)
            VALUES($1, $2, $3, $4, $5, timezone('UTC', NOW()))`, [adminId, req.body.country_id, latitude, longitude, req.body.admin_id]);
        
        await client.query(`
            INSERT INTO admin_translation(id, name, language_code, admin_id, created)
            VALUES($1, $2, $3, $4, timezone('UTC', NOW()))`, [translationId, req.body.name, req.body.language_code, adminId]);
        
        await client.query(`
            INSERT INTO admin_to_translation(admin_id, translation_id)
            VALUES($1, $2)`, [adminId, translationId]);

        await client.query(`
            UPDATE admin${level}
            SET default_translation = $1
            WHERE id = $2`, [translationId, adminId]);

        await client.query('COMMIT');

        res.status(201);
        res.send({
            adminId
        });
    } catch (error) {
        await client.query('ROLLBACK');

        next(error);
    } finally {
        client.release();
    }
}

export default addAdmin;