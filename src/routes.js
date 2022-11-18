import express from 'express';
import { checkApiKey } from './middlewares/apikey.js';
import addAdmin from './routes/admin/post.admin.js';
import removeContinentTranslation from './routes/continent/delete.continent.translation.js';
import getContinent from './routes/continent/get.continent.js';
import getContinents from './routes/continent/get.continents.js';
import addContinentTranslation from './routes/continent/post.continent.translation.js';
import updateContinentTranslation from './routes/continent/put.continent.translation.js';
import removeCountryTranslation from './routes/country/delete.country.translation.js';
import getCountries from './routes/country/get.countries.js';
import getCountry from './routes/country/get.country.js';
import addCountry from './routes/country/post.country.js';
import addCountryTranslation from './routes/country/post.country.translation.js';
import addPlace from './routes/place/post.place.js';
const router = express.Router();

router.get('/continent', checkApiKey, (req, res, next) => {
    getContinents(req, res, next);
});

router.get('/continent/:id', checkApiKey, (req, res, next) => {
    getContinent(req, res, next);
});

router.post('/continent/translation', checkApiKey, (req, res, next) => {
    addContinentTranslation(req, res, next);
});

router.put('/continent/translation', checkApiKey, (req, res, next) => {
    updateContinentTranslation(req, res, next);
});

router.delete('/continent/translation/:id', checkApiKey, (req, res, next) => {
    removeContinentTranslation(req, res, next);
});

router.post('/country', checkApiKey, (req, res, next) => {
    addCountry(req, res, next);
});

router.post('/country/translation', checkApiKey, (req, res, next) => {
    addCountryTranslation(req, res, next);
});

router.get('/country/:id', checkApiKey, (req, res, next) => {
    getCountry(req, res, next);
});

router.get('/country', checkApiKey, (req, res, next) => {
    getCountries(req, res, next);
});

router.delete('/country/translation/:id', checkApiKey, (req, res, next) => {
    removeCountryTranslation(req, res, next);
});

router.post('/place', checkApiKey, (req, res, next) => {
    addPlace(req, res, next);
});

router.post('/admin', checkApiKey, (req, res, next) => {
    addAdmin(req, res, next);
});

// All other routes get 404.
router.get('*', (req, res, next) => {
    next({ status: 404, success: false, message: 'This URL can not be found on the API, try a valid route.' });
});

export default router;