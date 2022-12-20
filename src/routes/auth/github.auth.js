import { getClient } from "../../database/connection.js";

async function getGithubAuth(req, res, next) {
    const client = await getClient();
    
    try {
        if (!req.query.code) {
            throw({ message: 'Auth code not provided', status: 400 });
        }

        const response = await getGithubToken(req.query.code);
        const user = await getUserInfo(response.access_token);

        await client.query('BEGIN');

        // check if the user exists
        const userExists = await client.query(`SELECT id FROM contributor WHERE github_user_id = $1`, [user.id]);

        if (!userExists.rows.length) {
            // create the user
            await client.query(`
                INSERT INTO contributor (github_user_id, github_user_name, github_avatar, created)
                VALUES ($1, $2, $3, NOW())`, [user.id, user.login, user.avatar_url]);
        }

        await client.query('COMMIT');

        // redirect to the frontend
        res.redirect(`${FRONTEND_URL}/auth/github?access_token=${response.access_token}&user_id=${user.id}`);
    } catch (error) {
        next(error);
    } finally {
        client.release();
    }
}

async function getGithubToken(code) {
    try {
        const rootUrl = 'https://github.com/login/oauth/access_token';
        const clientId = process.env.GITHUB_OAUTH_CLIENT_ID;
        const clientSecret = process.env.GITHUB_OAUTH_CLIENT_SECRET;
        const response = await fetch(`${rootUrl}?client_id=${clientId}&client_secret=${clientSecret}&code=${code}`, {
            headers: {
                'Accept': 'application/json'
            }
        });

        const data = await response.json();

        return data;
    } catch (error) {
        next(error);
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

export default getGithubAuth;