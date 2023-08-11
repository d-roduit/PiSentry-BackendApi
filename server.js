import express from 'express';
import cors from 'cors';
import v1Router from './api/v1/router.js';
import './dbConnection.js'
import dbConnection from "./dbConnection.js";

const port = process.env.PORT;
const app = express();

app.use(cors());

app.use(express.json()); // For parsing application/json request body

const logMiddleware = (req, res, next) => {
    console.log(`${req.method} ${req.originalUrl} received`);
    next();
};

const authMiddleware = async (req, res, next) => {
    const { access_token: authorizationTokenFromUrlParams } = req.query;
    const authorizationTokenFromHeader = req.get('authorization');

    const authorizationToken = authorizationTokenFromHeader ?? authorizationTokenFromUrlParams;
    const authorizationTokenSupplied = typeof authorizationToken !== 'undefined';

    if (!authorizationTokenSupplied) {
        console.log('Unauthorized!');
        return res.status(401).json({ error: 'Unauthorized!' });
    }

    const sqlQuery = `
        SELECT user_id
        FROM user
        WHERE token = ?
    `;

    try {
        const [rows] = await dbConnection.execute(sqlQuery, [authorizationToken]);
        const tokenFoundInDB = rows.length !== 0;

        if (!tokenFoundInDB) {
            console.log('Unauthorized!');
            return res.status(401).json({ error: 'Unauthorized!' });
        }

        const [user] = rows;

        req.pisentryParams = req.pisentryParams || {};
        req.pisentryParams.authorizedUser = user;

        next();
    } catch (e) {
        console.log('Exception caught in authMiddleware():', e);
        return res.status(500).json({ error: 'Could not verify authorization'});
    }
};

app.use(logMiddleware);
app.use(authMiddleware);

app.use('/v1', v1Router);

app.listen(port, () => console.log(`Express server listening on port ${port}...`));

/**
 * Routes
 */

app.get('/thuan', (req, res) => res.json('Thubiduuuu awaaa je t\'AIMEEE <3'));

// 404 middleware.
// Since it's placed last it will be
// the last middleware called, if all others
// invoke next() and do not respond.
const error404Middleware = (req, res) => {
    res.status(404);
    res.send({ error: "Sorry, can't find that" });
};

app.use(error404Middleware);