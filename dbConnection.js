import mysql from 'mysql2';
import config from "./config/config.js";

const { db_host, db_user, db_password, db_database } = config;

const dbConnection = mysql.createConnection({
    host: db_host,
    user: db_user,
    password: db_password,
    database: db_database,
});

export default dbConnection.promise();