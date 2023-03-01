import FetchRequest from '../../../helpers/FetchRequest.js';
import config from '../../../config/config.js';

FetchRequest
    .defaultResponseNotOk((response) => console.log(response))
    .defaultException((err) => console.log(err));

const { cameraApiUrl } = config;

export const startStreaming = () => {
    new FetchRequest(`${cameraApiUrl}/streaming/start`).options({ method: 'POST' }).make();
};

export const stopStreaming = () => {
    new FetchRequest(`${cameraApiUrl}/streaming/stop`).options({ method: 'POST' }).make();
};