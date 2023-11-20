import dbConnectionPool from '../../../dbConnection.js';

export const createSession = async (req, res) => {
    const { user_id } = req.pisentryParams.authorizedUser;

    const sqlQuery = `
        INSERT INTO detection_session (FK_user_id) VALUES (?)
    `;

    try {
        const [rows] = await dbConnectionPool.execute(sqlQuery, [user_id]);
        res.status(201).json({ session_id: rows.insertId });
    } catch (e) {
        console.log('Exception caught in createSession():', e);
        res.status(500).json({ error: 'Could not create session' });
    }
};