import express from 'express';
import { checkApiKey } from './middlewares/apikey.js';
import getAdmin from './routes/admin/get.admin.js';
import getAdminsByCountry from './routes/admin/get.admins.country.js';
import getAdminsByAdmin from './routes/admin/get.admins.js';
import addAdmin from './routes/admin/post.admin.js';
import addAdminTranslation from './routes/admin/post.admin.translation.js';
import updateAdminTranslation from './routes/admin/put.admin.translation.js';
import getUser from './routes/auth/get.user.js';
import getGithubAuth from './routes/auth/github.auth.js';
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
import updateCountryTranslation from './routes/country/put.country.translation.js';
import getLanguages from './routes/language/get.languages.js';
import removePlaceTranslation from './routes/place/delete.place.translation.js';
import getBoundingBox from './routes/place/get.bbox.js';
import getPlace from './routes/place/get.place.js';
import addPlace from './routes/place/post.place.js';
import addPlaceTranslation from './routes/place/post.place.translation.js';
import updatePlace from './routes/place/put.place.js';
import updatePlaceTranslation from './routes/place/put.place.translation.js';
import getQueue from './routes/queue/get.queue.js';
import addQueue from './routes/queue/post.queue.js';
const router = express.Router();

// CONTINENT
router.get('/continent', (req, res, next) => {
    getContinents(req, res, next);
});

router.get('/continent/:id', (req, res, next) => {
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

// COUNTRY
router.post('/country', checkApiKey, (req, res, next) => {
    addCountry(req, res, next);
});

router.post('/country/translation', checkApiKey, (req, res, next) => {
    addCountryTranslation(req, res, next);
});

router.put('/country/translation', checkApiKey, (req, res, next) => {
    updateCountryTranslation(req, res, next);
});

router.get('/country/:id', (req, res, next) => {
    getCountry(req, res, next);
});

router.get('/country', (req, res, next) => {
    getCountries(req, res, next);
});

router.delete('/country/translation/:id', checkApiKey, (req, res, next) => {
    removeCountryTranslation(req, res, next);
});

// PLACE
router.get('/place/:id', (req, res, next) => {
    getPlace(req, res, next);
});

router.post('/place', checkApiKey, (req, res, next) => {
    addPlace(req, res, next);
});

router.put('/place', checkApiKey, (req, res, next) => {
    updatePlace(req, res, next);
});

router.post('/place/translation', checkApiKey, (req, res, next) => {
    addPlaceTranslation(req, res, next);
});

router.put('/place/translation', checkApiKey, (req, res, next) => {
    updatePlaceTranslation(req, res, next);
});

router.delete('/place/translation/:id', checkApiKey, (req, res, next) => {
    removePlaceTranslation(req, res, next);
});

router.post('/place/boundingbox', (req, res, next) => {
    getBoundingBox(req, res, next);
});

// ADMIN
router.post('/admin', checkApiKey, (req, res, next) => {
    addAdmin(req, res, next);
});

router.get('/admin/country/:countryid', (req, res, next) => {
    getAdminsByCountry(req, res, next);
});

router.get('/admin/list/:id', (req, res, next) => {
    getAdminsByAdmin(req, res, next);
});

router.get('/admin/:id', (req, res, next) => {
    getAdmin(req, res, next);
});

router.post('/admin/translation', (req, res, next) => {
    addAdminTranslation(req, res, next);
});

router.put('/admin/translation', (req, res, next) => {
    updateAdminTranslation(req, res, next);
});

// OTHER
router.get('/language', (req, res, next) => {
    getLanguages(req, res, next);
});

// QUEUE
router.get('/queue', (req, res, next) => {
    getQueue(req, res, next);
});

router.post('/queue', (req, res, next) => {
    addQueue(req, res, next);
});

// Github Auth
router.get('/auth/github', (req, res, next) => {
    getGithubAuth(req, res, next);
});

router.get('/auth/user', (req, res, next) => {
    getUser(req, res, next);
});

// All other routes get 404.
router.get('*', (req, res, next) => {
    next({ status: 404, success: false, message: 'This URL can not be found on the API, try a valid route.' });
});

export default router;