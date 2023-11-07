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

export const requireCameraMiddleware = async (req, res, next) => {
    const cameraId = parseInt(req.params.camera_id);

    const isCameraIdSupplied = !Number.isNaN(cameraId) && cameraId >= 0;

    if (!isCameraIdSupplied) {
        return res.status(400).json({ error: 'A positive integer must be supplied for camera id' });
    }

    const sqlQuery = `
        SELECT camera_id, name, port, FK_user_id
        FROM camera
        WHERE camera_id = ? AND FK_user_id = ? 
    `;

    const { user_id } = req.pisentryParams.authorizedUser;

    try {
        const [rows] = await dbConnectionPool.execute(sqlQuery, [cameraId, user_id]);
        const cameraFoundInDB = rows.length !== 0;

        if (!cameraFoundInDB) {
            return res.status(404).json({ error: 'Camera not found' });
        }

        const [camera] = rows;

        req.pisentryParams = req.pisentryParams || {};
        req.pisentryParams.camera = camera;

        next();
    } catch (e) {
        console.log('Exception caught in requireCameraMiddleware():', e);
        return res.status(500).json({ error: 'Could not get camera data'});
    }
};
