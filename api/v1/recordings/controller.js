import FetchRequest from '../../../helpers/FetchRequest.js';
import config from '../../../config/config.js';
import dbConnection from '../../../dbConnection.js';

const { cameraApiUrl } = config;

export const getRecordings = (req, res) => {
    new FetchRequest(`${cameraApiUrl}/recordings/`)
        .options({ method: 'GET' })
        .success((data) => res.json(data))
        .responseNotOk((response) => res.status(response.statusCode).send(response.statusText))
        .exception((err) => res.status(500).send(err.message))
        .make();
};

export const getRecording = (req, res) => {
    const filename = req.params.filename;
    new FetchRequest(`${cameraApiUrl}/recordings/${filename}`)
        .options({ method: 'GET' })
        .responseType(FetchRequest.ResponseType.ArrayBuffer)
        .success((data) => res.type('video/mp4').send(Buffer.from(data)))
        .responseNotOk((response) => res.status(response.statusCode).send(response.statusText))
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
    }
};

