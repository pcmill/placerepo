import { getClient } from "../../database/connection.js";

async function getCountries(req, res, next) {
    const client = await getClient();
    
    try {
        let countries = [];

        if (req.query.lang) {
            countries = await getCountriesWithLang(req.query.lang, client);
        } else {
            countries = await getCountriesByDefault(client);    
        }

        res.status(200);
        res.send(countries);
    } catch (error) {
        next(error);
    } finally {
        client.release();
    }
}

async function getCountriesWithLang(lang, client) {
    return new Promise(async (resolve, reject) => {
        try {
            const countries = await client.query(`
                SELECT 
                    c.id, 
                    COALESCE(ct.name, ctr.name) AS name,
                    (CASE WHEN COUNT(ct.id) > 0 THEN 1 ELSE 0 END),
                    COUNT(ctc.id) AS "translations"
                FROM country AS c
                LEFT JOIN country_translation AS ct ON ct.country_id = c.id AND ct.language_code = $1
                INNER JOIN country_translation AS ctr ON ctr.id = c.default_translation
                INNER JOIN country_translation AS ctc ON ctc.country_id = c.id
                GROUP BY c.id, ct.name, ctr.name
                ORDER BY name
            `, [lang]);
    
            resolve(countries.rows);
        } catch (error) {
            reject({ message: `Could not get the country list with language ${lang}.`});
        }
    });
}

async function getCountriesByDefault(client) {
    return new Promise(async (resolve, reject) => {
        try {            
            const countries = await client.query(`
                SELECT ctt.country_id AS "id", ct.name, COUNT(ctc.id) AS "translations"
                FROM country AS c
                LEFT JOIN country_to_translation AS ctt ON ctt.country_id = c.id
                INNER JOIN country_translation AS ct ON ct.id = c.default_translation
                INNER JOIN country_translation AS ctc ON ctt.translation_id = ctc.id
                GROUP BY ctt.country_id, ct.name
                ORDER BY ct.name
            `);
    
            resolve(countries.rows);
        } catch (error) {
            reject({ message: 'Could not get the country list.'});
        }
    });
}

export default getCountries;