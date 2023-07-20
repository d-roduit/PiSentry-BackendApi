import FetchRequest from '../../../helpers/FetchRequest.js';
import config from '../../../config/config.js';

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

