const development = {
    cameraApiUrl: 'http://192.168.1.196:9090',
    db_host: process.env.DB_HOST,
    db_user: process.env.DB_USER,
    db_password: process.env.DB_PASSWORD,
    db_database: process.env.DB_DATABASE,
};

const production = {
    cameraApiUrl: 'http://127.0.0.1:4040',
    db_host: process.env.DB_HOST,
    db_user: process.env.DB_USER,
    db_password: process.env.DB_PASSWORD,
    db_database: process.env.DB_DATABASE,
};

const config = process.env.NODE_ENV === 'production' ? production : development;

export default config;