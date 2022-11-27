import { getClient } from "../../database/connection.js";

async function getAdminsByAdmin(req, res, next) {
    const client = await getClient();

    try {
        const level = Number(req.params.level);
        const id = req.params.id;

        if (![1, 2, 3, 4].includes(level)) {
            throw({ message: 'Not a valid level.', status: 400 });
        }

        // check if the id exists
        const admin = await client.query(`SELECT * FROM admin${level} WHERE id = $1`, [id]);

        if (!admin.rows.length) {
            throw({ message: 'This admin was not found!', status: 404 });
        }

        let admins = [];

        if (req.query.lang) {
            admins = await getAdminsWithLang(id, level, req.query.lang, client);
        } else {
            admins = await getAdminsByDefault(id, level, client);    
        }

        res.status(200);
        res.send(admins);
    } catch (error) {
        console.log(error);
        next(error);
    } finally {
        client.release();
    }
}

async function getAdminsWithLang(id, level, lang, client) {
    return new Promise(async (resolve, reject) => {
        try {
            const admins = await client.query(`
                SELECT 
                    a.id, 
                    COALESCE(adt.name, adr.name) AS name,
                    (CASE WHEN COUNT(adt.id) > 0 THEN 1 ELSE 0 END),
                    COUNT(adc.id) AS "translations"
                FROM admin${level + 1} AS a
                LEFT JOIN admin${level + 1}_translation AS adt ON adt.admin${level + 1}_id = a.id AND adt.language_code = $1
                INNER JOIN admin${level + 1}_translation AS adr ON adr.id = a.default_translation
                INNER JOIN admin${level + 1}_translation AS adc ON adc.admin${level + 1}_id = a.id
                WHERE a.id = $2
                GROUP BY a.id, adt.name, adr.name
                ORDER BY name
            `, [lang, id]);
    
            resolve(admins.rows);
        } catch (error) {
            reject({ message: `Could not get the admin list with language ${lang}.`});
        }
    });
}

async function getAdminsByDefault(id, level, client) {
    return new Promise(async (resolve, reject) => {
        try {
            const countries = await client.query(`
                SELECT a.id, adt.name, COUNT(adc.id) AS "translations"
                FROM admin${level + 1} AS a
                INNER JOIN admin${level + 1}_translation AS adt ON adt.id = a.default_translation
                INNER JOIN admin${level + 1}_translation AS adc ON adc.admin${level + 1}_id = a.id
                WHERE a.admin${level}_id = $1
                GROUP BY a.id, adt.name
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