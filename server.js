import express from 'express';
import cors from 'cors';
import v1Router from './api/v1/router.js';
import { requireAuth } from './middlewares.js';

const port = process.env.PORT;
const app = express();

app.options('*', cors()); // To put before other requests. Handles the CORS pre-flight requests.

app.use(cors());

app.use(express.json()); // For parsing application/json request body

app.use(requireAuth); // Placed first for authentication to be done before any other route handler

app.use('/v1', v1Router);

// Quick and easy to remember test route
app.get('/thuan', (req, res) => res.json('Test route made of love <3'));

const error404Middleware = (req, res) => {
    res.status(404);
    res.send({ error: "Sorry, can't find that" });
};

app.use(error404Middleware); // Placed last to be called if no other route handler responded

const httpsEnabled = !!(process.env.HTTPS_PORT && process.env.HTTPS_KEY && process.env.HTTPS_CERT);

if (httpsEnabled) {
    const fs = await import('fs');
    const http = await import('http');
    const https = await import('https');

    const privateKey  = fs.readFileSync(`./https_certificates/${process.env.HTTPS_KEY}`, 'utf8');
    const certificate = fs.readFileSync(`./https_certificates/${process.env.HTTPS_CERT}`, 'utf8');
    const credentials = { key: privateKey, cert: certificate };
    const httpsPort = process.env.HTTPS_PORT;

    const httpServer = http.createServer(app);
    const httpsServer = https.createServer(credentials, app);

    httpServer.listen(port, () => console.log(`Express server listening HTTP on port ${port}...`));
    httpsServer.listen(httpsPort, () => console.log(`Express server listening HTTPS on port ${httpsPort}...`));
} else {
    app.listen(port, () => console.log(`Express server listening on port ${port}...`));
}
