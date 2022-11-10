import express from 'express';
import getContinent from './routes/continent/get.continent.js';
import getContinents from './routes/continent/get.continents.js';
const router = express.Router();

router.get('/continent', (req, res, next) => {
    getContinents(req, res, next);
});

router.get('/continent/:id', (req, res, next) => {
    getContinent(req, res, next);
});

// All other routes get 404.
router.get('*', (req, res, next) => {
    next({ status: 404, success: false, message: 'This URL can not be found on the API, try a valid route.' });
});

export default router;