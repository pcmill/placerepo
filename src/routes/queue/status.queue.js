import fetch from "node-fetch";
import { getClient } from "../../database/connection.js";
import { checkToken } from "../../util/auth.js";

async function updateStatusQueue(req, res, next) {
    const client = await getClient();
    
    try {
        if (!req.body || !req.body.status) {
            throw({ message: 'Missing stuff', status: 400 });
        }

        await client.query('BEGIN');

        const task = await client.query(`SELECT * FROM queue WHERE id = $1`, [req.params.id]);

        if (!task.rows) {
            throw({ message: 'This task was not found!', status: 404 });
        }

        if (task.rows[0].status !== 0) {
            throw({ message: 'This task is not pending', status: 400 });
        }

        const token = req.headers['x-access-token'];
        
        if (!token) {
            throw({ message: 'Missing token', status: 401 });
        }
        
        const user = await checkToken(token);
        const contributor = await client.query(`SELECT * FROM contributor WHERE github_user_id = $1`, [user.id]);

        if (!contributor.rows) {
            throw({ message: 'This contributor was not found!', status: 404 });
        }

        if (contributor.rows[0].level !== 2 || contributor.rows[0].banned === true) {
            throw({ message: 'You are not allowed to do this!', status: 401 });
        }

        if (req.body.status === 1) {
            if (task.rows[0].request_type === 'add_place') {
                await sendRequest('/v1/place', 'POST', task.rows[0].request);
            }

            if (task.rows[0].request_type === 'update_place') {
                await sendRequest('/v1/place', 'PUT', task.rows[0].request);
            }

            if (task.rows[0].request_type === 'add_place_translation') {
                await sendRequest('/v1/place/translation', 'POST', task.rows[0].request);
            }

            if (task.rows[0].request_type === 'update_place_translation') {
                await sendRequest('/v1/place/translation', 'PUT', task.rows[0].request);
            }

            if (task.rows[0].request_type === 'add_country_translation') {
                await sendRequest('/v1/country/translation', 'POST', task.rows[0].request);
            }

            if (task.rows[0].request_type === 'add_continent_translation') {
                await sendRequest('/v1/continent/translation', 'POST', task.rows[0].request);
            }

            if (task.rows[0].request_type === 'add_admin_translation') {
                await sendRequest('/v1/admin/translation', 'POST', task.rows[0].request);
            }
        }

        await client.query(`
            UPDATE queue
            SET status = $1, status_changed_on = NOW(), status_changed_by = $2
            WHERE id = $3`, [req.body.status, user.id, req.params.id]);

        await client.query('COMMIT');

        res.status(200);
        res.send({
            message: 'Done!'
        });
    } catch (error) {
        next(error);
    } finally {
        client.release();
    }
}

async function sendRequest(endpoint, method, request) {
    console.log(endpoint, method, request);
    return new Promise(async (resolve, reject) => {
        try {
            const result = await fetch(`${process.env.BACKEND_URL}${endpoint}`, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': process.env.APIKEY
                },
                body: JSON.stringify(request)
            });

            console.log(result);
            const json = await result.json();
            console.log(json);

            if (result.status !== 201) {
                throw({ message: 'Something went wrong', status: 500 });
            }

            resolve();
        } catch (error) {
            reject(error);
        }
    });
}

export default updateStatusQueue;