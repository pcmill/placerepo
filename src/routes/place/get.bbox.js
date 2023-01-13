import { getClient } from "../../database/connection.js";

async function getBoundingBox(req, res, next) {
    const client = await getClient();

    try {
        if (!req.body ||
            !req.body.boundingbox) {
            throw({ message: 'Missing stuff', status: 400 });
        }

        const northWest = req.body.boundingbox[0];
        const southEast = req.body.boundingbox[1];

        if (northWest.length !== 2 || southEast.length !== 2) {
            throw({ message: 'Invalid bounding box', status: 400 });
        }

        try {
            Number(northWest[0]);
            Number(northWest[1]);
            Number(southEast[0]);
            Number(southEast[1]);
        } catch (error) {
            throw({ message: 'Invalid coordinates', status: 400});
        }

        // Calculate the area size of the bounding box
        const area = (southEast[1] - northWest[1]) * (southEast[0] - northWest[0]);

        let query = '';
        if (area < 0.25) {
            query = `
                SELECT p.id, pt.name, p.latitude, p.longitude, p.population, p.polygon
                FROM place AS p
                INNER JOIN place_translation AS pt ON pt.id = p.default_translation
                WHERE p.latitude < $1
                AND p.latitude > $2
                AND p.longitude < $3
                AND p.longitude > $4
            `;
        } else {
            query = `
                SELECT p.id, pt.name, p.latitude, p.longitude, p.population
                FROM place AS p
                INNER JOIN place_translation AS pt ON pt.id = p.default_translation
                WHERE p.latitude < $1
                AND p.latitude > $2
                AND p.longitude < $3
                AND p.longitude > $4
            `;
        }

        const places = await client.query(query, [northWest[0], southEast[0], northWest[1], southEast[1]]);

        res.status(200);
        res.send({
            places: places.rows
        });
    } catch (error) {
        next(error);
    } finally {
        client.release();
    }
}

export default getBoundingBox;