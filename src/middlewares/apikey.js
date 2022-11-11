export function checkApiKey(req, res, next) {
    try {
        const apiKey = req.headers['x-api-key'];

        if (!apiKey) {
            return res.status(400).send({
                message: 'No valid api key found.'
            });
        }

        if (apiKey !== process.env.APIKEY) {
            return res.status(400).send({
                message: 'This api key is not valid.'
            });
        }

        next();
    } catch (error) {
        return res.status(500).send({
            message: 'Something went wrong checking your api key.'
        });
    }
}