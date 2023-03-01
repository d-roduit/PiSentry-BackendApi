import FetchRequest from '../../../helpers/FetchRequest.js';
import config from '../../../config/config.js';

FetchRequest
    .defaultResponseNotOk((response) => console.log('response not ok:', response))
    .defaultException((err) => console.log('exception:', err));

const { cameraApiUrl } = config;

export const getRecordings = (req, res) => {
    new FetchRequest(`${cameraApiUrl}/recordings/`)
        .success((data) => res.json(data))
        .make();
};

export const getRecording = (req, res) => {
    const filename = req.params.filename;
    new FetchRequest(`${cameraApiUrl}/recordings/${filename}`)
        .responseType(FetchRequest.ResponseType.ArrayBuffer)
        .success((data) => res.type('video/mp4').send(Buffer.from(data)))
        .make();
};

