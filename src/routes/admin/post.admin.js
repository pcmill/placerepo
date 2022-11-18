import { getClient } from "../../database/connection.js";
import { checkLatLon } from "../../util/latlon.js";
import { randomId } from "../../util/random.js";

async function addAdmin(req, res, next) {
    const client = await getClient();

    try {
        if (!req.body || 
            !req.body.level ||
            !req.body.country_id || 
            !req.body.name || 
            !req.body.latitude || 
            !req.body.longitude ||
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

        const level = Number(req.body.level);

        if (![1, 2, 3, 4].includes(level)) {
            throw({ message: 'Not a valid level.', status: 400 });
        }

        // Check if the admin exists.
        if (level > 1) {
            if (!req.body[`admin${level - 1}_id`]) {
                throw({ message: 'Admins that are not top-level need another admin to fall under.', status: 404 });
            }

            const adminAbove = await client.query(`SELECT * FROM admin${level - 1} WHERE id = $1`, [req.body[`admin${level - 1}_id`]]);

            if (!adminAbove.rows) {
                throw({ message: 'This admin was not found!', status: 404 });
            }
        }

        let admin;

        if (level === 1) {
            admin = await client.query(`
                INSERT INTO admin1(id, country_id, latitude, longitude, created)
                VALUES($1, $2, $3, $4, NOW())
                RETURNING *`, [adminId, req.body.country_id, latitude, longitude]);
        } else {
            admin = await client.query(`
                INSERT INTO admin${level}(id, country_id, latitude, longitude, admin${level - 1}_id, created)
                VALUES($1, $2, $3, $4, $5, NOW())
                RETURNING *`, [adminId, req.body.country_id, latitude, longitude, req.body[`admin${level - 1}_id`]]);
        }
        
        const translation = await client.query(`
            INSERT INTO admin${level}_translation(id, name, language_code, admin${level}_id, created)
            VALUES($1, $2, $3, $4, NOW())
            RETURNING *`, [translationId, req.body.name, req.body.language_code, admin.rows[0].id]);

        await client.query(`
            UPDATE admin${level}
            SET default_translation = $1
            WHERE id = $2`, [translation.rows[0].id, admin.rows[0].id]);

        await client.query('COMMIT');

        res.status(201);
        res.send({
            [`admin${level}_id`]: adminId
        });
    } catch (error) {
        await client.query('ROLLBACK');

        next(error);
    } finally {
        client.release();
    }
}

export default addAdmin;