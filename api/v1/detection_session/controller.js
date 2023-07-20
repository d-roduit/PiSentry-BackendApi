import dbConnection from "../../../dbConnection.js";

export const createSession = async (req, res) => {
    const { user_id } = req.body;

    const sqlQuery = `
        INSERT INTO detection_session (FK_user_id) VALUES (?)
    `;

    try {
        const [rows] = await dbConnection.execute(sqlQuery, [user_id]);
        res.type('application/json').send({ session_id: rows.insertId });
    } catch (e) {
        console.log('Exception caught in createSession():', e);
    }
};