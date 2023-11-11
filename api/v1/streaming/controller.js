import FetchRequest from '../../../helpers/FetchRequest.js';
import config from '../../../config/config.js';

const { cameraApiUrl } = config;

export const startStreaming = async (req, res) => {
    const { port: cameraPort } = req.pisentryParams.camera;
    await new FetchRequest(`${cameraApiUrl}:${cameraPort}/streaming/start`)
        .options({ method: 'POST' })
        .success(() => res.status(200).end())
        .responseNotOk((response) => res.status(response.status).send(response.statusText))
        .exception((err) => res.status(500).send(err.message))
        .make();
};

export const stopStreaming = async (req, res) => {
    const { port: cameraPort } = req.pisentryParams.camera;
    await new FetchRequest(`${cameraApiUrl}:${cameraPort}/streaming/stop`)
        .options({ method: 'POST' })
        .success(() => res.status(200).end())
        .responseNotOk((response) => res.status(response.status).send(response.statusText))
        .exception((err) => res.status(500).send(err.message))
        .make();
};