import dbConnectionPool from '../../../dbConnection.js';
import { isObjectEmpty, isStringPositiveInteger } from '../../../helpers/validation.js';
import { requestCameraToUpdateItsConfig } from '../../../helpers/utilsFunctions.js';

export const getDetectableObjectsActions = async (req, res) => {
    const { user_id } = req.pisentryParams.authorizedUser;
    const { camera_id } = req.pisentryParams.camera;

    const sqlQuery = `
        SELECT
            detectable_object_action.object_action_id,
            detectable_object.object_id,
            detectable_object.object_type,
            detectable_object.object_weight,
            detectable_object.object_order,
            detection_action.action_id,
            detection_action.name AS action_name,
            detection_action.action_order
        FROM detectable_object_action
            INNER JOIN detectable_object ON detectable_object_action.FK_detectable_object_id = detectable_object.object_id
            INNER JOIN detection_action ON detectable_object_action.FK_detection_action_id = detection_action.action_id
            INNER JOIN camera ON detectable_object_action.FK_camera_id = camera.camera_id
        WHERE camera.FK_user_id = ? AND detectable_object_action.FK_camera_id = ?
        ORDER BY detectable_object.object_order ASC
    `;

    try {
        const [rows] = await dbConnectionPool.execute(sqlQuery, [user_id, camera_id]);
        res.json(rows);
    } catch (e) {
        console.log('Exception caught in getDetectableObjectsActions():', e);
        res.status(500).json({ error: 'Could not get actions of detectable objects' });
    }
};

export const getDetectableObjectAction = async (req, res) => {
    const { user_id } = req.pisentryParams.authorizedUser;
    const { camera_id } = req.pisentryParams.camera;

    const isObjectTypeAcceptable = req.params.object_type.length > 0;

    if (!isObjectTypeAcceptable) {
        return res.status(400).json({ error: 'Object type must be specified' });
    }

    const objectType = req.params.object_type;

    const sqlQuery = `
        SELECT
            detectable_object_action.object_action_id,
            detectable_object.object_id,
            detectable_object.object_type,
            detectable_object.object_weight,
            detectable_object.object_order,
            detection_action.action_id,
            detection_action.name AS action_name,
            detection_action.action_order
        FROM detectable_object_action
            INNER JOIN detectable_object ON detectable_object_action.FK_detectable_object_id = detectable_object.object_id
            INNER JOIN detection_action ON detectable_object_action.FK_detection_action_id = detection_action.action_id
            INNER JOIN camera ON detectable_object_action.FK_camera_id = camera.camera_id
        WHERE camera.FK_user_id = ? AND detectable_object_action.FK_camera_id = ? AND detectable_object.object_type = ?
        ORDER BY detectable_object.object_order ASC
    `;

    try {
        const [rows] = await dbConnectionPool.execute(sqlQuery, [user_id, camera_id, objectType]);
        res.json(rows);
    } catch (e) {
        console.log('Exception caught in getDetectableObjectAction():', e);
        res.status(500).json({ error: 'Could not get action of detectable object' });
    }
};

export const patchDetectableObjectAction = async (req, res) => {
    const { user_id } = req.pisentryParams.authorizedUser;
    const { cameraId } = req.pisentryParams;
    const { object_id } = req.params;

    const isObjectIdAcceptable = isStringPositiveInteger(object_id);

    if (!isObjectIdAcceptable) {
        return res.status(400).json({ error: 'Object id must be a positive integer' });
    }

    const objectId = parseInt(object_id, 10);

    if (isObjectEmpty(req.body)) {
        return res.status(400).json({ error: 'No fields to update provided' });
    }

    const errors= {};

    for (const [key, value] of Object.entries(req.body)) {
        switch (key) {
            case 'FK_detection_action_id':
                if (typeof value !== 'number') errors[key] = `${key} must be a positive integer`;
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
        UPDATE detectable_object_action
        INNER JOIN camera ON detectable_object_action.FK_camera_id = camera.camera_id
        SET ?
        WHERE
            camera.FK_user_id = ?
            AND detectable_object_action.FK_camera_id = ?
            AND detectable_object_action.FK_detectable_object_id = ?
    `;

    try {
        /**
         * We use `.query()` instead of `.execute()` because `.execute()` does not support taking arrays or objects as parameter.
         * On the other hand, `.query()` does client side placeholders substitution and thus allows arrays and objects.
         * The explanation:
         * https://github.com/sidorares/node-mysql2/issues/553#issuecomment-437221838
         */
        const [rows] = await dbConnectionPool.query(sqlQuery, [req.body, user_id, cameraId, objectId]);
        res.json(rows);
    } catch (e) {
        console.log('Exception caught in patchDetectableObjectAction():', e);
        res.status(500).json({ error: 'Could not patch detectable object action' });
        return;
    }

    await requestCameraToUpdateItsConfig({
        callerName: 'patchDetectableObjectAction',
        cameraId,
        userId: user_id
    });
};