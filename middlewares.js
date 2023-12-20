import dbConnectionPool from './dbConnection.js';

export const requireAuth = async (req, res, next) => {
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
        console.log('Exception caught in requireAuth():', e);
        return res.status(500).json({ error: 'Could not verify authorization'});
    }
};

export const requireCameraIdToBeInteger = (req, res, next) => {
    const cameraId = parseInt(req.params.camera_id);

    const isCameraIdAcceptable = !Number.isNaN(cameraId) && cameraId >= 0;

    if (!isCameraIdAcceptable) {
        return res.status(400).json({ error: 'Camera id must be a positive integer' });
    }

    req.pisentryParams = req.pisentryParams || {};
    req.pisentryParams.cameraId = cameraId;

    next();
};

export const requireCameraToExist = async (req, res, next) => {
    requireCameraIdToBeInteger(req, res, () => {});

    const sqlQuery = `
        SELECT camera_id, name, port, FK_user_id
        FROM camera
        WHERE camera_id = ? AND FK_user_id = ? 
    `;

    const { cameraId } = req.pisentryParams;
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
        console.log('Exception caught in requireCameraToExist():', e);
        return res.status(500).json({ error: 'Could not get camera data'});
    }
};
