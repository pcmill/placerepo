import { getClient } from "../../database/connection.js";
import { checkLatLon } from "../../util/latlon.js";
import { getTimezone } from "../../util/timezone.js";

async function updatePlace(req, res, next) {
    const client = await getClient();

    try {
        if (!req.body ||
            !req.body.place_id ||
            !req.body.country_id || 
            !req.body.latitude || 
            !req.body.longitude) {
            throw({ message: 'Missing stuff', status: 400 });
        }

        await client.query('BEGIN');

        // check if the id exists
        const place = await client.query(`SELECT * FROM place WHERE id = $1`, [req.body.place_id]);

        if (!place.rows) {
            throw({ message: 'This place was not found!', status: 404 });
        }

        // check if the id exists
        const country = await client.query(`SELECT * FROM country WHERE id = $1`, [req.body.country_id]);

        if (!country.rows) {
            throw({ message: 'This country was not found!', status: 404 });
        }

        // check if the id exists
        let admin_id;
        if (req.body.admin_id) {
            const admin = await client.query(`SELECT * FROM admin WHERE id = $1`, [req.body.admin_id]);

            if (!admin.rows) {
                throw({ message: 'This admin was not found!', status: 404 });
            }

            admin_id = req.body.admin_id;
        }

        const {latitude, longitude} = checkLatLon(req.body.latitude, req.body.longitude);

        const timezone = await getTimezone(latitude, longitude);

        let population;
        if (req.body.population) {
            population = checkPopulation(req.body.population);
        }

        let population_record_year;
        if (req.body.population_record_year) {
            population_record_year = checkPopulationRecordYear(req.body.population_record_year);
        }

        let population_approximate;
        if (req.body.population_approximate !== null) {
            population_approximate = checkPopulationApproximate(req.body.population_approximate);
        }

        let elevation_meters = 0;
        if (req.body.elevation_meters) {
            elevation_meters = checkElevation(req.body.elevation_meters);
        }

        let polygon;
        if (req.body.polygon) {
            polygon = checkPolygon(req.body.polygon);
        }

        let wikidata_id;
        if (req.body.wikidata_id) {
            wikidata_id = checkWikidataId(req.body.wikidata_id);
        }

        await client.query(`
            UPDATE place
            SET
                country_id = $1,
                latitude = $2,
                longitude = $3,
                timezone = $4,
                population = $5,
                population_approximate = $6,
                population_record_year = $7,
                elevation_meters = $8,
                polygon = $9,
                wikidata_id = $10,
                admin_id = $11,
                updated = NOW()
            WHERE id = $12`, [
                req.body.country_id,
                latitude,
                longitude,
                timezone,
                population,
                population_approximate,
                population_record_year,
                elevation_meters,
                polygon,
                wikidata_id,
                admin_id,
                req.body.place_id
            ]);

        await client.query('COMMIT');

        res.status(201);
        res.send({
            message: 'Done'
        });
    } catch (error) {
        await client.query('ROLLBACK');

        next(error);
    } finally {
        client.release();
    }
}

function checkPopulation(population) {
    try {
        population = Number(population);

        if (population < 0) {
            throw({ message: 'Population can not be negative.', status: 400 });
        }

        if (population > 50000000) {
            throw({ message: 'Population can not be larger than 50 million.', status: 400 });
        }

        return population;
    } catch (error) {
        throw(error);
    }
}

function checkElevation(elevation) {
    try {
        elevation = Number(elevation);

        if (elevation < -500) {
            throw({ message: 'Elevation can not be smaller than -500.', status: 400 });
        }

        if (elevation > 10000) {
            throw({ message: 'Elevation can not be larger than 10000.', status: 400 });
        }

        return elevation;
    } catch (error) {
        throw(error);
    }
}

function checkPopulationRecordYear(year) {
    try {
        year = Number(year);

        if (year < 0) {
            throw({ message: 'Year can not be negative.', status: 400 });
        }

        if (year > new Date().getFullYear() + 1) {
            throw({ message: `Year can not be larger than ${new Date().getFullYear() + 1}.`, status: 400 });
        }

        return year;
    } catch (error) {
        throw(error);
    }
}

function checkPopulationApproximate(population_approximate) {
    try {
        population_approximate = Boolean(population_approximate);

        return population_approximate;
    } catch (error) {
        throw(error);
    }
}

function checkPolygon(polygon) {
    try {
        polygon = JSON.parse(polygon);

        if (!Array.isArray(polygon)) {
            throw({ message: 'Polygon must be an array.', status: 400 });
        }

        if (polygon.length < 3) {
            throw({ message: 'Polygon must have at least 3 points.', status: 400 });
        }

        if (polygon.length > 512) {
            throw({ message: 'Polygon can not have more than 512 points.', status: 400 });
        }

        // Check if the first and last point are the same
        if (polygon[0][0] !== polygon[polygon.length - 1][0] || polygon[0][1] !== polygon[polygon.length - 1][1]) {
            throw({ message: 'First and last point should be equal.', status: 400 });
        }

        polygon.forEach((point) => {
            if (!Array.isArray(point)) {
                throw({ message: 'Polygon points must be arrays.', status: 400 });
            }

            if (point.length !== 2) {
                throw({ message: 'Polygon points must have exactly 2 values.', status: 400 });
            }

            const {latitude, longitude} = checkLatLon(point[1], point[0]);

            point[0] = longitude;
            point[1] = latitude;
        });

        return JSON.stringify(polygon);
    } catch (error) {
        throw(error);
    }
}

function checkWikidataId(wikidata_id) {
    try {
        wikidata_id = String(wikidata_id);

        if (wikidata_id.length > 64) {
            throw({ message: 'Wikidata ID can not be longer than 64 characters.', status: 400 });
        }

        if (wikidata_id.length === 0) {
            throw({ message: 'Wikidata ID can not be empty.', status: 400 });
        }

        if (wikidata_id[0].toUpperCase() !== 'Q') {
            throw({ message: 'Wikidata ID must start with a Q.', status: 400 });
        }

        wikidata_id = wikidata_id.toUpperCase();

        return wikidata_id;
    } catch (error) {
        throw(error);
    }
}

export default updatePlace;