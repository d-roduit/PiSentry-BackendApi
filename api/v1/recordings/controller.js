import FetchRequest from '../../../helpers/FetchRequest.js';
import config from '../../../config/config.js';
import dbConnection from '../../../dbConnection.js';

const { cameraApiUrl } = config;

export const getRecordings = async (req, res) => {
    const { user_id } = req.pisentryParams.authorizedUser;

    const sqlQuery = `
        SELECT detection_session.session_id AS 'detection_session_id', JSON_ARRAYAGG(JSON_OBJECT(
                'recording_id', recording.recording_id,
                'recorded_at', recording.recorded_at,
                'recording_filename', recording.filename
        )) AS 'recordings'
        FROM recording
        JOIN detection_session ON recording.FK_detection_session_id = detection_session.session_id
        WHERE detection_session.FK_user_id = ?
        GROUP BY detection_session.session_id
        ORDER BY detection_session.session_id DESC
    `;

    try {
        const [rows] = await dbConnection.execute(sqlQuery, [user_id]);
        res.json({ detectionSessions: rows });
    } catch (e) {
        console.log('Exception caught in getRecordings():', e);
        res.status(500).json({ error: 'Could not get recordings' });
    }
};

export const getRecording = (req, res) => {
    const { filename } = req.params;
    new FetchRequest(`${cameraApiUrl}/recordings/${filename}`)
        .options({ method: 'GET' })
        .responseType(FetchRequest.ResponseType.ArrayBuffer)
        .success((data) => res.type('video/mp4').send(Buffer.from(data)))
        .responseNotOk((response) => res.status(response.status).send(response.statusText))
        .exception((err) => res.status(500).send(err.message))
        .make();
};

export const createRecording = async (req, res) => {
    const { recorded_at, filename, detection_session_id, camera_id } = req.body;

    const sqlQuery = `
        INSERT INTO recording (recorded_at, filename, FK_detection_session_id, FK_camera_id) VALUES (?, ?, ?, ?)
    `;

    try {
        const [rows] = await dbConnection.execute(sqlQuery, [
            recorded_at,
            filename,
            detection_session_id,
            camera_id
        ]);

        res.type('application/json').send({ recording_id: rows.insertId });
    } catch (e) {
        console.log('Exception caught in createRecording():', e);
        res.status(500).json({ error: 'Could not create recording' });
    }
};

