const development = {
    cameraApiUrl: 'http://192.168.1.196:9090'
};

const production = {
    cameraApiUrl: 'http://127.0.0.1:4040'
};

const config = process.env.NODE_ENV === 'production' ? production : development;

export default config;