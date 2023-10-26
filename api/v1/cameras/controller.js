import dbConnectionPool from '../../../dbConnection.js';

export const getCameras = async (req, res) => {
    const { user_id } = req.pisentryParams.authorizedUser;

    const sqlQuery = `
        SELECT camera_id, name, port FROM camera WHERE FK_user_id = ?
    `;

    try {
        const [rows] = await dbConnectionPool.execute(sqlQuery, [user_id]);
        res.json(rows);
    } catch (e) {
        console.log('Exception caught in getCameras():', e);
        res.status(500).json({ error: 'Could not get cameras' });
    }
};