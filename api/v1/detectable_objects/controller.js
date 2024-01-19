import dbConnectionPool from '../../../dbConnection.js';

export const getDetectableObjects = async (req, res) => {
    const sqlQuery = `
        SELECT object_id, object_type, object_weight, object_order
        FROM detectable_object
        ORDER BY object_order ASC
    `;

    try {
        const [rows] = await dbConnectionPool.query(sqlQuery);
        res.json(rows);
    } catch (e) {
        console.log('Exception caught in getDetectableObjects():', e);
        res.status(500).json({ error: 'Could not get detectable objects' });
    }
};
