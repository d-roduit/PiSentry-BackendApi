import express from 'express';
import cors from 'cors';
import v1Router from './api/v1/router.js';
import { authMiddleware } from './middlewares.js';

const port = process.env.PORT;
const app = express();

app.use(cors());

app.use(express.json()); // For parsing application/json request body

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