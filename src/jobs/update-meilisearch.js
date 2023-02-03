import { getClient } from "../database/connection.js";
import dotenv from 'dotenv';

async function updateMeilisearch() {
    try {
        dotenv.config();

        const client = await getClient();

        console.log('Running query...');

        client.query(`
            SELECT
                pt.id AS id, 
                p.id AS "entity_id",
                pt.name, 
                pt.language_code AS language,
                p.population,
                p.elevation_meters,
                p.wikidata_id,
                a1t.name AS "admin_1",
                a2t.name AS "admin_2",
                a3t.name AS "admin_3",
                a4t.name AS "admin_4",
                COALESCE(ctt.name, ct.name) AS country,
                COALESCE(conttt.name, contt.name) AS continent
            FROM place_translation AS pt
            INNER JOIN place_to_translation AS ptt ON ptt.translation_id = pt.id
            INNER JOIN place AS p ON p.id = ptt.place_id
            
            INNER JOIN country AS c ON c.id = p.country_id
            INNER JOIN country_translation AS ct ON ct.id = c.default_translation
            
            LEFT JOIN LATERAL (
                SELECT *
                FROM country_to_translation AS ctt
                LEFT JOIN country_translation AS ct2 ON ct2.id = ctt.translation_id
                WHERE ctt.country_id = c.id
                AND ct2.language_code = pt.language_code
                LIMIT 1
            ) AS ctt ON ctt.country_id = c.id
            
            INNER JOIN continent AS cont ON cont.id = c.continent_id
            INNER JOIN continent_translation AS contt ON contt.id = cont.default_translation
            
            LEFT JOIN LATERAL (
                SELECT *
                FROM continent_to_translation AS conttt
                LEFT JOIN continent_translation AS ct3 ON ct3.id = conttt.translation_id
                WHERE conttt.continent_id = cont.id
                AND ct3.language_code = pt.language_code
                LIMIT 1
            ) AS conttt ON conttt.continent_id = cont.id
            
            LEFT JOIN admin AS a1 ON a1.id = p.admin_id
            LEFT JOIN admin_translation AS a1t ON a1t.id = a1.default_translation
            
            LEFT JOIN admin AS a2 ON a2.id = a1.admin_id
            LEFT JOIN admin_translation AS a2t ON a2t.id = a2.default_translation

            LEFT JOIN admin AS a3 ON a3.id = a2.admin_id
            LEFT JOIN admin_translation AS a3t ON a3t.id = a3.default_translation
            
            LEFT JOIN admin AS a4 ON a4.id = a3.admin_id
            LEFT JOIN admin_translation AS a4t ON a4t.id = a4.default_translation

            WHERE p.created BETWEEN NOW() - INTERVAL '30 MINUTES' AND NOW()
            OR p.updated BETWEEN NOW() - INTERVAL '30 MINUTES' AND NOW()
        `, async (err, result) => {
            if (err) {
                console.log(err);
            }

            if (result.rows.length > 0) {
                console.log('Updating MeiliSearch...');

                // Insert the data into MeiliSearch as JSON
                const res = await fetch(`https://search.tisura.com/indexes/geo/documents`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${process.env.MEILI_KEY}`
                    },
                    body: JSON.stringify(result.rows)
                });

                const data = await res.json();
                console.log(data);
            }
        });
    } catch (error) {
        console.log(error);
    }
};

export default updateMeilisearch;