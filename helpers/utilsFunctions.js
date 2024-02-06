import dbConnectionPool from '../dbConnection.js';
import FetchRequest from './FetchRequest.js';
import config from '../config/config.js';

const { cameraApiUrl } = config;

export const requestCameraToUpdateItsConfig = async ({ callerName, cameraId, userId }) => {
    const getCameraSqlQuery = `
            SELECT
                camera_id,
                name,
                port,
                TIME_FORMAT(detection_start_time, '%H:%i') AS 'detection_start_time',
                TIME_FORMAT(detection_end_time, '%H:%i') AS 'detection_end_time',
                detection_areas,
                TIME_FORMAT(notifications_start_time, '%H:%i') AS 'notifications_start_time',
                TIME_FORMAT(notifications_end_time, '%H:%i') AS 'notifications_end_time',
                FK_user_id
            FROM camera
            WHERE camera_id = ? AND FK_user_id = ? 
        `;

    try {
        const [rows] = await dbConnectionPool.query(getCameraSqlQuery, [cameraId, userId]);

        const cameraPort = rows?.[0]?.port;

        if (typeof cameraPort === 'undefined') {
            return;
        }

        await new FetchRequest(`${cameraApiUrl}:${cameraPort}/config/reload`)
            .options({ method: 'POST' })
            .responseNotOk(() => console.log('Response not ok returned from requesting camera to update its config'))
            .exception((err) => console.log(`Exception caught in ${callerName}() while requesting camera to update its config: ${err.message}`))
            .make();
    } catch (e) {
        console.log(`Exception caught in ${callerName}() while getting camera from database: ${e}`);
    }
};

