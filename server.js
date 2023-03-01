import express from 'express';
import cors from 'cors';

const port = process.env.PORT;
const app = express();

app.use(cors());

app.use(express.json()); // For parsing application/json request body

const logMiddleware = (req, res, next) => {
    console.log(`request to ${req.originalUrl} received`);
    next();
};

app.use(logMiddleware);

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