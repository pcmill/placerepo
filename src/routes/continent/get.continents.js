import { getClient } from "../../database/connection.js";

async function getContinents(req, res, next) {
    try {
        const client = await getClient();
        let continents = [];

        if (req.query.lang) {
            continents = await getContinentWithLang(req.query.lang, client);
        } else {
            continents = await getContinentByDefault(client);    
        }

        client.release();

        res.status(200);
        res.send(continents);
    } catch (error) {
        next(error);
    }
}

async function getContinentWithLang(lang, client) {
    return new Promise(async (resolve, reject) => {
        try {
            const continents = await client.query(`
                SELECT c.id, ct.name
                FROM continent AS c
                INNER JOIN continent_translation AS ct ON ct.continent_id = c.id
                WHERE ct.language_code = $1
                ORDER BY ct.name
            `, [lang]);
    
            resolve(continents.rows);
        } catch (error) {
            reject({ message: `Could not get the continents list with language ${lang}.`});
        }
    });
}

async function getContinentByDefault(client) {
    return new Promise(async (resolve, reject) => {
        try {            
            const continents = await client.query(`
                SELECT c.id, ct.name
                FROM continent AS c
                INNER JOIN continent_translation AS ct ON ct.id = c.default_translation
                ORDER BY ct.name
            `);
    
            resolve(continents.rows);
        } catch (error) {
            reject({ message: 'Could not get the continents list.'});
        }
    });
}

export default getContinents;