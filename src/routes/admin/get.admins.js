import { getClient } from "../../database/connection.js";

async function getAdminsByAdmin(req, res, next) {
    const client = await getClient();

    try {
        const id = req.params.id;

        // check if the id exists
        const admin = await client.query(`SELECT * FROM admin WHERE id = $1`, [id]);

        if (!admin.rows.length) {
            throw({ message: 'This admin was not found!', status: 404 });
        }

        const admins = await getAdminsByDefault(id, client);    

        res.status(200);
        res.set('Cache-contol', 'public, max-age=60');
        res.send(admins);
    } catch (error) {
        console.log(error);
        next(error);
    } finally {
        client.release();
    }
}

async function getAdminsByDefault(id, client) {
    return new Promise(async (resolve, reject) => {
        try {
            const countries = await client.query(`
                SELECT a.id, adt.name, ct.name AS "country", COUNT(adc.id) AS "translations"
                FROM admin AS a
                INNER JOIN admin_to_translation AS att ON att.admin_id = a.id
                INNER JOIN admin_translation AS adt ON adt.id = a.default_translation
                INNER JOIN admin_translation AS adc ON adc.id = att.translation_id
                INNER JOIN country AS c ON c.id = a.country_id
                INNER JOIN country_translation AS ct ON ct.id = c.default_translation
                WHERE a.admin_id = $1
                GROUP BY a.id, adt.name, ct.name
                ORDER BY adt.name
            `, [id]);

            resolve(countries.rows);
        } catch (error) {
            console.log(error);
            reject({ message: 'Could not get the admin list.'});
        }
    });
}

export default getAdminsByAdmin;