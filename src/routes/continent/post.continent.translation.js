import { getClient } from "../../database/connection.js";
import { randomId } from "../../util/random.js";

async function addContinentTranslation(req, res, next) {
    const client = await getClient();

    try {
        if (!req.body || !req.body.continent_id || !req.body.name || !req.body.language_code) {
            throw({ message: 'Missing stuff', status: 400 });
        }

        const translationId = await randomId(12);

        await client.query('BEGIN');

        // check if the id exists
        const continent = await client.query(`SELECT * FROM continent WHERE id = $1`, [req.body.id]);

        if (!continent.rows) {
            throw({ message: 'This continent was not found!', status: 404 });
        }

        await client.query(`
            INSERT INTO continent_translation(id, name, language_code, continent_id, created)
            VALUES($1, $2, $3, $4, NOW())`, [translationId, req.body.name, req.body.language_code, req.body.continent_id]);
        
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

export default addContinentTranslation;