import dbConnectionPool from '../../../dbConnection.js';

export const getDetectionActions = async (req, res) => {
    const sqlQuery = `
        SELECT action_id, action_order, name
        FROM detection_action
        ORDER BY action_order ASC
    `;

    try {
        const [rows] = await dbConnectionPool.execute(sqlQuery, []);
        res.json(rows);
    } catch (e) {
        console.log('Exception caught in getDetectionActions():', e);
        res.status(500).json({ error: 'Could not get detection actions' });
    }
};