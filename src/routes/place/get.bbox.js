import { getClient } from "../../database/connection.js";

async function getBoundingBox(req, res, next) {
    const client = await getClient();

    try {
        if (!req.body ||
            !req.body.boundingbox) {
            throw({ message: 'Missing stuff', status: 400 });
        }

        const corner1 = req.body.boundingbox[0];
        const corner2 = req.body.boundingbox[1];

        if (corner1.length !== 2 || corner2.length !== 2) {
            throw({ message: 'Invalid bounding box', status: 400 });
        }

        try {
            Number(corner1[0]);
            Number(corner1[1]);
            Number(corner2[0]);
            Number(corner2[1]);
        } catch (error) {
            throw({ message: 'Invalid coordinates', status: 400});
        }

        const places = await client.query(`
            SELECT p.id, pt.name, p.latitude, p.longitude, p.population
            FROM place AS p
            INNER JOIN place_translation AS pt ON pt.id = p.default_translation
            WHERE p.latitude > $1
            AND p.latitude < $2
            AND p.longitude > $3
            AND p.longitude < $4
        `, [corner1[0], corner2[0], corner1[1], corner2[1]]);

        res.status(200);
        res.send({
            places: places.rows
        });
    } catch (error) {
        next(error);
    }
}

export default getBoundingBox;