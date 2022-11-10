import express from 'express';
import removeContinentTranslation from './routes/continent/delete.continent.translation.js';
import getContinent from './routes/continent/get.continent.js';
import getContinents from './routes/continent/get.continents.js';
import addContinentTranslation from './routes/continent/post.continent.translation.js';
import updateContinentTranslation from './routes/continent/put.continent.translation.js';
const router = express.Router();

router.get('/continent', (req, res, next) => {
    getContinents(req, res, next);
});

router.get('/continent/:id', (req, res, next) => {
    getContinent(req, res, next);
});

router.post('/continent/translation', (req, res, next) => {
    addContinentTranslation(req, res, next);
});

router.put('/continent/translation', (req, res, next) => {
    updateContinentTranslation(req, res, next);
});

router.delete('/continent/translation/:id', (req, res, next) => {
    removeContinentTranslation(req, res, next);
});

// All other routes get 404.
router.get('*', (req, res, next) => {
    next({ status: 404, success: false, message: 'This URL can not be found on the API, try a valid route.' });
});

export default router;