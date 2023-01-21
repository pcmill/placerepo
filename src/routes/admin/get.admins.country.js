import { getClient } from "../../database/connection.js";

async function getAdminsByCountry(req, res, next) {
    const client = await getClient();

    try {
        // check if the id exists
        const country = await client.query(`SELECT * FROM country WHERE id = $1`, [req.params.countryid]);
    
        if (!country.rows.length) {
            throw({ message: 'This country was not found!', status: 404 });
        }
    
        const country_id = req.params.countryid;

        let admins = [];

        if (req.query.lang) {
            admins = await getAdminsWithLang(country_id, req.query.lang, client);
        } else {
            admins = await getAdminsByDefault(country_id, client);    
        }

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

async function getAdminsWithLang(country_id, lang, client) {
    return new Promise(async (resolve, reject) => {
        try {
            const admins = await client.query(`
                SELECT 
                    a.id, 
                    COALESCE(adt.name, adr.name) AS name,
                    (CASE WHEN COUNT(adt.id) > 0 THEN 1 ELSE 0 END),
                    COUNT(adc.id) AS "translations"
                FROM admin1 AS a
                LEFT JOIN admin1_translation AS adt ON adt.admin1_id = a.id AND adt.language_code = $1
                INNER JOIN admin1_translation AS adr ON adr.id = a.default_translation
                INNER JOIN admin1_translation AS adc ON adc.admin1_id = a.id
                WHERE a.country_id = $2
                GROUP BY a.id, adt.name, adr.name
                ORDER BY name
            `, [lang, country_id]);
    
            resolve(admins.rows);
        } catch (error) {
            reject({ message: `Could not get the admin list with language ${lang}.`});
        }
    });
}

async function getAdminsByDefault(country_id, client) {
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
                WHERE a.country_id = $1
                AND a.admin_id IS NULL
                GROUP BY a.id, adt.name, ct.name
                ORDER BY adt.name
            `, [country_id]);
    
            resolve(countries.rows);
        } catch (error) {
            reject({ message: 'Could not get the admin list.'});
        }
    });
}

export default getAdminsByCountry;