import FetchRequest from '../../../helpers/FetchRequest.js';
import config from '../../../config/config.js';
import dbConnectionPool from '../../../dbConnection.js';

const { cameraApiUrl } = config;

export const getRecordings = async (req, res) => {
    const { user_id } = req.pisentryParams.authorizedUser;

    const sqlQuery = `
        SELECT
            subquery.recordings_date AS 'recordings_date',
            JSON_ARRAYAGG(JSON_OBJECT(
                'detection_session_id', subquery.detection_session_id,
                'recordings', subquery.recordings
            )) AS 'detection_sessions'
        FROM (
            SELECT
                DATE(recording.recorded_at) AS 'recordings_date',
                detection_session.session_id AS 'detection_session_id',
                JSON_ARRAYAGG(JSON_OBJECT(
                    'recording_id', recording.recording_id,
                    'recorded_at', recording.recorded_at,
                    'recording_filename', recording.recording_filename,
                    'recording_extension', recording.recording_extension,
                    'thumbnail_filename', recording.thumbnail_filename,
                    'thumbnail_extension', recording.thumbnail_extension,
                    'object_type', detectable_object.object_type
                )) AS 'recordings'
            FROM recording
                JOIN detection_session ON recording.FK_detection_session_id = detection_session.session_id
                JOIN detectable_object ON recording.FK_detectable_object_id = detectable_object.object_id
            WHERE detection_session.FK_user_id = ?
            GROUP BY
                detection_session.session_id,
                DATE(recording.recorded_at)
            ORDER BY detection_session.session_id DESC
        ) AS subquery
        GROUP BY subquery.recordings_date
        ORDER BY subquery.recordings_date DESC
    `;

    try {
        const [rows] = await dbConnectionPool.execute(sqlQuery, [user_id]);
        res.json(rows);
    } catch (e) {
        console.log('Exception caught in getRecordings():', e);
        res.status(500).json({ error: 'Could not get recordings' });
    }
};

export const getRecording = (req, res) => {
    const { filename } = req.params;

    new FetchRequest(`${cameraApiUrl}/recordings/${filename}`)
        .options({
            method: 'GET',
            headers: {
                'User-Agent': req.get('User-Agent'),
                'Range': req.get('Range'),
                'Accept': req.get('Accept'),
                'Accept-Encoding': req.get('Accept-Encoding'),
                'Accept-Language': req.get('Accept-Language'),
            }
        })
        .success(async (responseData, response) => {
            await response.body.pipeTo(
                new WritableStream({
                    start() {
                        res.status(response.status);
                        response.headers.forEach((headerValue, headerName) => res.set(headerName, headerValue));
                    },
                    write(chunk) {
                        res.write(chunk);
                    },
                    close() {
                        res.end();
                    },
                    abort() {
                        res.end();
                    },
                })
            );
        })
        .responseNotOk((response) => {
            res.status(response.status).send(response.statusText);
        })
        .exception((err) => {
            console.log('Exception caught in getRecording():', err);
            res.status(500).send(err.message);
        })
        .make();
};

export const createRecording = async (req, res) => {
    const {
        recorded_at,
        recording_filename,
        recording_extension,
        thumbnail_filename,
        thumbnail_extension,
        detected_object_type,
        detection_session_id,
        camera_id
    } = req.body;

    const sqlQuery = `
        INSERT INTO recording (
            recorded_at,
            recording_filename,
            recording_extension,
            thumbnail_filename,
            thumbnail_extension,
            FK_detectable_object_id,
            FK_detection_session_id,
            FK_camera_id
        )
        VALUES (?, ?, ?, ?, ?, (SELECT object_id FROM detectable_object WHERE object_type = ?), ?, ?)
    `;

    try {
        const [rows] = await dbConnectionPool.execute(sqlQuery, [
            recorded_at,
            recording_filename,
            recording_extension,
            thumbnail_filename,
            thumbnail_extension,
            detected_object_type,
            detection_session_id,
            camera_id,
        ]);

        res.json({ recording_id: rows.insertId });
    } catch (e) {
        console.log('Exception caught in createRecording():', e);
        res.status(500).json({ error: 'Could not create recording' });
    }
};

export const deleteRecording = async (req, res) => {
    const { recording_filename } = req.body;

    const sqlQuery = `DELETE FROM recording WHERE recording_filename = ?`;

    try {
        const [rows] = await dbConnectionPool.execute(sqlQuery, [recording_filename]);
        
        res.json(rows);
    } catch (e) {
        console.log('Exception caught in deleteRecording():', e);
        res.status(500).json({ error: 'Could not delete recording' });
    }
};

