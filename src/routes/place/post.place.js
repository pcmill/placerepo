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
            !req.body.admin_id ||
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
        const admin = await client.query(`SELECT * FROM admin WHERE id = $1`, [req.body.admin_id]);

        if (!admin.rows) {
            throw({ message: 'This admin was not found!', status: 404 });
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
            INSERT INTO place(id, country_id, latitude, longitude, timezone, elevation_meters, admin_id, created)
            VALUES($1, $2, $3, $4, $5, $6, $7, NOW())`, [
                placeId, 
                req.body.country_id, 
                latitude, 
                longitude,
                timezone, 
                0,
                req.body.admin_id
            ]);
        
        await client.query(`
            INSERT INTO place_translation(id, name, language_code, created)
            VALUES($1, $2, $3, NOW())`, [translationId, req.body.name, req.body.language_code]);

        await client.query(`
            INSERT INTO place_to_translation(place_id, translation_id)
            VALUES($1, $2)`, [placeId, translationId]);
        
        await client.query(`
            UPDATE place
            SET default_translation = $1
            WHERE id = $2`, [translationId, placeId]);

        await client.query('COMMIT');

        res.status(201);
        res.send({
            placeId
        });
    } catch (error) {
        await client.query('ROLLBACK');

        next(error);
    } finally {
        client.release();
    }
}

export default addPlace;