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
                SELECT c.id, ct.name
                FROM country AS c
                INNER JOIN country_translation AS ct ON ct.country_id = c.id
                WHERE ct.language_code = $1
                ORDER BY ct.name
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
                SELECT c.id, ct.name
                FROM country AS c
                INNER JOIN country_translation AS ct ON ct.id = c.default_translation
                ORDER BY ct.name
            `);
    
            resolve(countries.rows);
        } catch (error) {
            reject({ message: 'Could not get the country list.'});
        }
    });
}

export default getCountries;