const development = {
    cameraApiUrl: 'http://127.0.0.1:4040'
};

const production = {
    cameraApiUrl: 'http://127.0.0.1:4040'
};

const config = process.env.NODE_ENV === 'production' ? production : development;

export default config;