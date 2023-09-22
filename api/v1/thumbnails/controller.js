import FetchRequest from '../../../helpers/FetchRequest.js';
import config from '../../../config/config.js';

const { cameraApiUrl } = config;

export const getThumbnail = (req, res) => {
    const { thumbnail_filename } = req.params;
    new FetchRequest(`${cameraApiUrl}/thumbnails/${thumbnail_filename}`)
        .options({ method: 'GET' })
        .responseType(FetchRequest.ResponseType.ArrayBuffer)
        .success((data) => res.type('image/jpeg').send(Buffer.from(data)))
        .responseNotOk((response) => res.status(response.status).send(response.statusText))
        .exception((err) => res.status(500).send(err.message))
        .make();
};
