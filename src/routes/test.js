import query from "../database/connection.js";

async function test(req, res, next) {
    try {
        const now = await query('SELECT NOW()');
        console.log(now);

        res.status(200);
        res.send({
            now
        });
    } catch (error) {
        next(error);
    }
}

export default test;