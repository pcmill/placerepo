import express from 'express';
const router = express.Router();

import test from './routes/test.js';

router.get('/test', (req, res, next) => {
    test(req, res, next);
});

// All other routes get 404.
router.get('*', (req, res, next) => {
    next({ status: 404, success: false, message: 'This URL can not be found on the API, try a valid route.' });
});

export default router;