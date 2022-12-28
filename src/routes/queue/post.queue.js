import { getClient } from "../../database/connection.js";
import { checkToken } from "../../util/auth.js";
import { checkAddingPlace } from "../../util/queue-checks.js";

async function addQueue(req, res, next) {
    const client = await getClient();
    
    try {
        const token = req.headers['x-access-token'];

        if (!token) {
            throw({ message: 'Missing token', status: 401 });
        }

        const user = await checkToken(token);

        await client.query('BEGIN');

        const contributor = await client.query(`SELECT * FROM contributor WHERE github_user_id = $1`, [user.id]);

        if (!contributor.rows) {
            throw({ message: 'This contributor was not found!', status: 404 });
        }

        if (!req.body || 
            !req.body.changeRequest ||
            !req.body.changeRequest.type ||
            !req.body.changeRequest.requestObject) {
            throw({ message: 'Missing stuff', status: 400 });
        }

        if (req.body.changeRequest.type === 'add_place') {
            checkAddingPlace(req.body.changeRequest.requestObject);
        } else {
            throw({ message: 'Invalid type', status: 400 });
        }

        // Status is 0 for pending
        // Status is 1 for approved
        // Status is 2 for rejected
        await client.query(`
            INSERT INTO queue(created, request, user_id, status, request_type)
            VALUES(NOW(), $1, $2, $3, $4)`, [req.body.changeRequest.requestObject, user.id, 0, req.body.changeRequest.type]);

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

export default addQueue;