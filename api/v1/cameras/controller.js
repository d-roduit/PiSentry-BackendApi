import dbConnectionPool from '../../../dbConnection.js';
import {
    isObjectEmpty,
    checkStringType,
    checkStringLength,
    checkTimeFormat,
} from '../../../helpers/validation.js';
import { requestCameraToUpdateItsConfig } from '../../../helpers/utilsFunctions.js';

export const getCameras = async (req, res) => {
    const { user_id } = req.pisentryParams.authorizedUser;

    const sqlQuery = `
        SELECT camera_id, name, port FROM camera WHERE FK_user_id = ?
    `;

    try {
        const [rows] = await dbConnectionPool.execute(sqlQuery, [user_id]);
        res.json(rows);
    } catch (e) {
        console.log('Exception caught in getCameras():', e);
        res.status(500).json({ error: 'Could not get cameras' });
    }
};

export const getCamera = async (req, res) => {
    const camera = req.pisentryParams.camera;
    res.json(camera);
};

export const patchCamera = async (req, res) => {
    const { user_id } = req.pisentryParams.authorizedUser;
    const { cameraId } = req.pisentryParams;

    if (isObjectEmpty(req.body)) {
        return res.status(400).json({ error: 'No fields to update provided' });
    }

    const errors= {};

    let error;

    for (const [key, value] of Object.entries(req.body)) {
        switch (key) {
            case 'camera_id':
            case 'port':
            case 'FK_user_id':
                errors[key] = 'No updates allowed on this field';
                break;
            case 'detection_start_time':
            case 'detection_end_time':
            case 'notifications_start_time':
            case 'notifications_end_time':
                if ((error = checkStringType(value)) !== null) errors[key] = error;
                else if ((error = checkTimeFormat(value)) !== null) errors[key] = error;
                break;
            case 'name':
                if ((error = checkStringType(value)) !== null) errors[key] = error;
                else if ((error = checkStringLength(value, 1, 35)) !== null) errors[key] = error;
                break;
            case 'detection_areas':
                // validate JSON structure using a library like Ajv
                break;
            default:
                errors[key] = 'Unknown field';
                break;
        }
    }

    if (!isObjectEmpty(errors)) {
        return res.status(400).json({ error: errors });
    }

    const sqlQuery = `
        UPDATE camera SET ? WHERE FK_user_id = ? AND camera_id = ?
    `;

    try {
        /**
         * We use `.query()` instead of `.execute()` because `.execute()` does not support taking arrays or objects as parameter.
         * On the other hand, `.query()` does client side placeholders substitution and thus allows arrays and objects.
         * The explanation:
         * https://github.com/sidorares/node-mysql2/issues/553#issuecomment-437221838
         */
        const [rows] = await dbConnectionPool.query(sqlQuery, [req.body, user_id, cameraId]);
        res.json(rows);
    } catch (e) {
        console.log('Exception caught in patchCamera():', e);
        res.status(500).json({ error: 'Could not patch camera' });
        return;
    }

    await requestCameraToUpdateItsConfig({
        callerName: 'patchCamera',
        cameraId,
        userId: user_id,
    });
};