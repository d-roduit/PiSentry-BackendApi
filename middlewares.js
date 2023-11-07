import dbConnectionPool from './dbConnection.js';

export const authMiddleware = async (req, res, next) => {
    const { access_token: authorizationTokenFromUrlParams } = req.query;
    const authorizationTokenFromHeader = req.get('authorization');

    const authorizationToken = authorizationTokenFromHeader ?? authorizationTokenFromUrlParams;
    const isAuthorizationTokenSupplied = typeof authorizationToken !== 'undefined';

    const requestReceived = `${req.method} ${req.originalUrl}`;

    if (!isAuthorizationTokenSupplied) {
        console.log(`${requestReceived} (Unauthorized)`);
        return res.status(401).json({ error: 'Unauthorized!' });
    }

    const sqlQuery = `
        SELECT user_id
        FROM user
        WHERE token = ?
    `;

    try {
        const [rows] = await dbConnectionPool.execute(sqlQuery, [authorizationToken]);
        const tokenFoundInDB = rows.length !== 0;

        if (!tokenFoundInDB) {
            console.log(`${requestReceived} (Unauthorized)`);
            return res.status(401).json({ error: 'Unauthorized!' });
        }

        const [user] = rows;

        req.pisentryParams = req.pisentryParams || {};
        req.pisentryParams.authorizedUser = user;

        console.log(`${requestReceived} (ok)`);

        next();
    } catch (e) {
        console.log('Exception caught in authMiddleware():', e);
        return res.status(500).json({ error: 'Could not verify authorization'});
    }
};
