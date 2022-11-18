import { getClient } from "../../database/connection.js";
import { checkLatLon } from "../../util/latlon.js";
import { randomId } from "../../util/random.js";
import { getTimezone } from "../../util/timezone.js";

async function addPlace(req, res, next) {
    const client = await getClient();

    try {
        if (!req.body || 
            !req.body.country_id || 
            !req.body.name || 
            !req.body.latitude || 
            !req.body.longitude ||
            !req.body.admin1_id ||
            !req.body.admin2_id || 
            !req.body.language_code) {
            throw({ message: 'Missing stuff', status: 400 });
        }

        const placeId = await randomId(8);
        const translationId = await randomId(12);

        await client.query('BEGIN');

        // check if the id exists
        const country = await client.query(`SELECT * FROM country WHERE id = $1`, [req.body.country_id]);

        if (!country.rows) {
            throw({ message: 'This country was not found!', status: 404 });
        }

        // check if the id exists
        const admin1 = await client.query(`SELECT * FROM admin1 WHERE id = $1`, [req.body.admin1_id]);
        const admin2 = await client.query(`SELECT * FROM admin2 WHERE id = $1`, [req.body.admin2_id]);

        if (!admin1.rows || !admin2.rows) {
            throw({ message: 'This admin was not found!', status: 404 });
        }

        if (req.body.admin3_id) {
            const admin3 = await client.query(`SELECT * FROM admin3 WHERE id = $1`, [req.body.admin3_id]);

            if (!admin3.rows) {
                throw({ message: 'This admin was not found!', status: 404 });
            }
        }

        if (req.body.admin4_id) {
            const admin4 = await client.query(`SELECT * FROM admin4 WHERE id = $1`, [req.body.admin4_id]);

            if (!admin4.rows) {
                throw({ message: 'This admin was not found!', status: 404 });
            }
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

        const timezone = await getTimezone(latitude, longitude);

        const place = await client.query(`
            INSERT INTO place(id, country_id, latitude, longitude, timezone, elevation_meters, admin1, admin2, admin3, admin4, created)
            VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
            RETURNING *`, [
                placeId, 
                req.body.country_id, 
                latitude, 
                longitude,
                timezone, 
                0, 
                req.body.admin1_id,
                req.body.admin2_id, 
                req.body.admin3_id,
                req.body.admin4_id
            ]);
        
        const translation = await client.query(`
            INSERT INTO place_translation(id, name, language_code, place_id, created)
            VALUES($1, $2, $3, $4, NOW())
            RETURNING *`, [translationId, req.body.name, req.body.language_code, place.rows[0].id]);

        await client.query(`
            UPDATE place
            SET default_translation = $1
            WHERE id = $2`, [translation.rows[0].id, place.rows[0].id]);

        await client.query('COMMIT');

        res.status(201);
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

export default addPlace;