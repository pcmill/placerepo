import { getClient } from "../database/connection.js";
import fs from 'fs';
import dotenv from 'dotenv';
import AWS from 'aws-sdk';
import { filesize } from 'filesize';

async function generateCSV() {
    try {
        dotenv.config();

        const file = fs.createWriteStream('./temp.csv');
        const client = await getClient();

        console.log('Running query...');

        client.query(`
            SELECT
                pt.id AS id, 
                p.id AS "entity-id",
                pt.name, 
                pt.language_code AS language,
                p.population,
                p.elevation_meters,
                p.wikidata_id,
                a1t.name AS "admin-1",
                a2t.name AS "admin-2",
                a3t.name AS "admin-3",
                a4t.name AS "admin-4",
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
        `, (err, result) => {
            if (err) {
                console.log(err);
            }

            console.log('Writing to file...');

            // Write the header to the csv
            file.write(Object.keys(result.rows[0]).join(',') + '\n');

            // Write the rows to the csv
            result.rows.forEach(row => {
                file.write(Object.values(row).join(',') + '\n');
            });

            file.on('error', (e) => {
                console.log(e);
            });

            // Close the file
            file.end();

            // Check when file is done writing
            file.on('finish', () => {
                // Upload the file to S3
                console.log('Uploading to S3...');
    
                const date = new Date();
                const year = date.getFullYear();
                const month = `${date.getMonth() + 1}`.padStart(2, "0");
                const day = `${date.getDate()}`.padStart(2, "0");
    
                const name = `placerepo-${year}${month}${day}.csv`;
    
                const s3 = new AWS.S3({
                    accessKeyId: process.env.R2_ACCESS_KEY,
                    secretAccessKey: process.env.R2_SECRET_KEY,
                    endpoint: `https://${process.env.R2_ACCOUNT_KEY}.r2.cloudflarestorage.com`,
                    signatureVersion: 'v4'
                });
    
                const read = fs.createReadStream('./temp.csv');
                const filesizeBytes = fs.statSync('./temp.csv');
                const filesizeText = filesize(filesizeBytes.size, {round: 0});
    
                const params = {
                    Bucket: 'placerepo',
                    Key: name,
                    Body: read,
                    ContentType: 'text/csv'
                };
    
                s3.upload(params, function (error, data) {
                    if (error) {
                        console.log(error);
                    }
    
                    read.close();
    
                    const url = `https://pub-137e15e854754bb99dbe4c683e63670a.r2.dev/${name}`;
        
                    // Write to database
                    console.log('Writing to database...');
        
                    client.query(`
                        INSERT INTO download (name, url, created, type, size_text)
                        VALUES ($1, $2, timezone('UTC', NOW()), $3, $4)
                    `, [name, url, 0, filesizeText], (err, result) => {
                        if (err) {
                            console.log(err);
                        }
    
                        // Delete the file
                        console.log('Deleting file...');
                        fs.unlinkSync('./temp.csv');
        
                        client.release();
                    });
                });
            });

        });
    } catch (error) {
        console.log(error);
    }
};

export default generateCSV;