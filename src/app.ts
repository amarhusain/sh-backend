import * as bodyparser from 'body-parser';
import cors from 'cors';
import { JwtPayload } from 'jsonwebtoken';
import mongoose from 'mongoose';
import logger from './common/logger';
import authRouter from './routes/auth.routes';
import districtRouter from './routes/district.routes';
import stateRouter from './routes/state.routes';

import express, { NextFunction, Request, Response } from 'express';
import path from 'path';
import { config } from './common/config';
import appointmentRouter from './routes/appointment.routes';



declare global {
    namespace Express {
        interface Request {
            currentUser?: JwtPayload;
            uploaderError?: Error;
        }
    }
}

const app: express.Application = express();

app.use(bodyparser.json());
app.use(cors());

// Define the error handling middleware function
function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
    logger.error(err.stack);
    res.status(500).send(err.name + ' : ' + err.message);
}

app.use('/api', authRouter);
app.use('/api', stateRouter);
app.use('/api/district', districtRouter);
app.use('/api/appointment', appointmentRouter);


app.get('/health', (req: Request, res: Response) => {
    const message = `Server is running at http://localhost:${process.env.port}`;
    const timestamp = new Date().toLocaleString();
    res.status(200).send({ message, timestamp });
});

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, '../build')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../build/index.html'));
})

// Handling non matching request from client
app.use((req: Request, res: Response, next: NextFunction) => {
    logger.error('[ERROR]: No matching API url "' + req.originalUrl + '" found.')
    res.status(404).send('No matching API url "' + req.originalUrl + '" found on the server.');
});

// Register the error handling middleware function
app.use(errorHandler);


try {

    // ------------ Uncomment for production -----------//
    mongoose.connect(config.mongoUri.prod);

    // ------------ Uncomment for development -----------//
    // mongoose.connect(config.mongoUri.dev);
    logger.info(`[DATABASE]: Connected with mongodb database.`)
} catch (err) {
    throw new Error('[ERROR]: Error connecting to database.')
}

export default app;