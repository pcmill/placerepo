import fetch from "node-fetch";
import { getClient } from "../../database/connection.js";

async function getUser(req, res, next) {
    const client = await getClient();
    
    try {
        if (!req.query.access_token) {
            throw({ message: 'Auth token not provided', status: 400 });
        }

        const user = await getUserInfo(req.query.access_token);

        // check if the user exists
        const contributor = await client.query(`SELECT id, level, banned FROM contributor WHERE github_user_id = $1`, [user.id]);

        if (!contributor.rows.length) {
            throw({ message: 'User not found', status: 404 });
        }

        if (contributor.rows[0].banned === true) {
            throw({ message: 'User is banned', status: 401 });
        }

        const data = {
            id: contributor.rows[0].id,
            github_user_id: user.id,
            github_user_name: user.login,
            github_avatar: user.avatar_url,
            level: contributor.rows[0].level,
        }

        res.status(200);
        res.send({
            ...data
        });
    } catch (error) {
        next(error);
    } finally {
        client.release();
    }
}

async function getUserInfo(access_token) {
    try {
        const response = await fetch(`https://api.github.com/user`, {
            headers: {
                'Authorization': `Bearer ${access_token}`
            }
        });

        const data = await response.json();

        return data;
    } catch (error) {
        next(error);
    }
}

export default getUser;

