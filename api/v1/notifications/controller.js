import webpush from 'web-push';
import config from '../../../config/config.js';
import dbConnectionPool from "../../../dbConnection.js";

const { vapidPublicKey, vapidPrivateKey } = config;

const vapidDetails = {
    subject: 'https://pisentry.app',
    publicKey: vapidPublicKey,
    privateKey: vapidPrivateKey,
};

webpush.setVapidDetails(vapidDetails.subject, vapidDetails.publicKey, vapidDetails.privateKey);

export const sendNotifications = async (req, res) => {
    const { user_id } = req.pisentryParams.authorizedUser;
    const { title, message, icon, timestamp, topic } = req.body;

    const sqlQuery = `
        SELECT subscription_id, subscription, FK_user_id
        FROM notification_subscription
        WHERE FK_user_id = ?
    `;

    let errorMessage = 'Could not get subscriptions';

    const pushOptions = {
        urgency: 'high', // whether to send the notifications immediately or prioritize the recipient’s device power
        TTL: 7 * 24 * 60 * 60, // 7 days * 24 hours/day * 60 minutes/hour * 60 seconds/minute
        topic: topic || 'default-topic',
    };

    try {
        const [rows] = await dbConnectionPool.execute(sqlQuery, [user_id]);

        const sendNotificationsPromises = rows.map(({ subscription }) => (
            webpush.sendNotification(
                JSON.parse(subscription),
                JSON.stringify({ title, message, icon, timestamp }),
                pushOptions
            )
        ));

        errorMessage = 'Could not send notifications';

        await Promise.all(sendNotificationsPromises);

        res.status(204).end();
    } catch (e) {
        console.log('Exception caught in sendNotifications():', e);
        res.status(500).json({ error: errorMessage });
    }
};

export const createSubscription = async (req, res) => {
    const { user_id } = req.pisentryParams.authorizedUser;
    const { subscription } = req.body;

    const jsonSubscription = JSON.stringify(subscription);

    const checkSubscriptionAlreadyExistSqlQuery = `
        SELECT subscription_id
        FROM notification_subscription
        WHERE subscription = ? AND FK_user_id = ?
    `;

    let errorMessage = 'Could not check if subscription already exist';

    try {
        const [checkSubscriptionAlreadyExistRows] = await dbConnectionPool.execute(
            checkSubscriptionAlreadyExistSqlQuery,
            [jsonSubscription, user_id]
        );

        const subscriptionAlreadyExist = checkSubscriptionAlreadyExistRows.length > 0;

        if (subscriptionAlreadyExist) {
            res.status(409).json({ error: 'Subscription already exist', subscription_id: checkSubscriptionAlreadyExistRows[0].subscription_id });
            return;
        }

        const insertSubscriptionSqlQuery = `
            INSERT INTO notification_subscription (subscription, FK_user_id) VALUES (?, ?)
        `;

        errorMessage = 'Could not create subscription';

        const [insertSubscriptionRows] = await dbConnectionPool.execute(insertSubscriptionSqlQuery, [jsonSubscription, user_id]);
        res.json({ subscription_id: insertSubscriptionRows.insertId });
    } catch (e) {
        console.log('Exception caught in createSubscription():', e);
        res.status(500).json({ error: errorMessage });
    }
};