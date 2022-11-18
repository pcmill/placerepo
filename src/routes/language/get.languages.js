import { getClient } from "../../database/connection.js";

async function getLanguages(req, res, next) {
    const client = await getClient();
    
    try {
        // check if the id exists
        const languages = await client.query(`SELECT * FROM language`);

        res.status(200);
        res.send(languages.rows);
    } catch (error) {
        next(error);
    } finally {
        client.release();
    }
}

export default getLanguages;