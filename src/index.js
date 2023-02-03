import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import cron from 'node-cron';
const app = express();

if (process.env.NODE_ENV !== 'production') {
    dotenv.config();
}

const port = process.env.PORT || 8881;
import routes from './routes.js';
import generateCSV from './jobs/generate-csv.js';
import updateMeilisearch from './jobs/update-meilisearch.js';

const corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200,
}

// configure bodyParser
app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Disable standard Express header for security purposes
app.disable('x-powered-by');

// Make the routes and let them react on /v1
app.use('/v1', routes);

// Error handler
app.use(function (err, req, res, next) {
    // render the error page
    console.log(err);
    res.status(err.status || 500).send(err);
});

// Start our server
// When unit tests are running they stop and start the server themselves
// or else they give a port used error.
if (process.env.NODE_ENV != 'test') {
    app.listen(port, () => {
        console.log(`Server started on port ${port}`);
    });
}

// Start the cronjobs for generating the CSV files
if (process.env.NODE_ENV === 'production') {
    console.log('Starting cronjob CSV generation');
    
    cron.schedule('0 20 * * 6', async () => {
        await generateCSV();
    });

    console.log('Starting cronjob Meilisearch update');
    
    cron.schedule('30 * * * *', async () => {
        await updateMeilisearch();
    });
}

export default app;