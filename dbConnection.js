import mysql from 'mysql2';
import config from "./config/config.js";

const { db_host, db_user, db_password, db_database } = config;

const dbConnectionPool = mysql.createPool({
    host: db_host,
    user: db_user,
    password: db_password,
    database: db_database,
    dateStrings: [
        'DATE', // DATE are returned as strings (otherwise they would be interpreted as YYYY-MM-DD 00:00:00+00:00)
        'DATETIME' // DATETIME return as strings (otherwise they would interpreted as YYYY-MM-DD HH:mm:ss+00:00)
    ],
    idleTimeout: 3600000, // idle connections' timeout. Set to 1 hour in milliseconds (60 * 60 * 1000)
});

export default dbConnectionPool.promise();