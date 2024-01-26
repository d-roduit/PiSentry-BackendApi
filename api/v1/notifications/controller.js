import webpush from 'web-push';
import config from '../../../config/config.js';
import dbConnectionPool from '../../../dbConnection.js';
import { isObjectEmpty } from '../../../helpers/validation.js';

const { vapidPublicKey, vapidPrivateKey } = config;

const vapidDetails = {
    subject: 'https://pisentry.app',
    publicKey: vapidPublicKey,
    privateKey: vapidPrivateKey,
};

webpush.setVapidDetails(vapidDetails.subject, vapidDetails.publicKey, vapidDetails.privateKey);

const ensureValidTopic = (topic) => {
    let validTopic = topic ?? 'default-topic';

    if (typeof validTopic !== 'string') {
        validTopic = String(validTopic);
    }

    if (validTopic.length > 32) {
        validTopic = validTopic.substring(0, 32);
    } else if (validTopic.length < 32) {
        validTopic = validTopic.padEnd(32, '0');
    }

    return validTopic;
}

export const sendNotifications = async (req, res) => {
    const { user_id } = req.pisentryParams.authorizedUser;
    const { cameraId } = req.pisentryParams;
    const { notification } = req.body;

    const isNotificationAcceptable = typeof notification === 'object' && !isObjectEmpty(notification);

    if (!isNotificationAcceptable) {
        return res.status(400).json({ error: 'Notification must be passed as an object' });
    }

    const { title, message, icon, timestamp } = notification;
    let { topic } = notification;

    const selectSubscriptionsSqlQuery = `
        SELECT subscription_id, subscription, FK_camera_id, FK_user_id
        FROM notification_subscription
        WHERE FK_camera_id = ? AND FK_user_id = ?
    `;

    let errorMessage = 'Could not get subscriptions';

    // Make sure topic is 32 characters (workaround for the possible "BadWebPushTopic" error with Apple webpush otherwise)
    // https://stackoverflow.com/questions/75685856/what-is-the-cause-of-badwebpushtopic-from-https-web-push-apple-com
    topic = ensureValidTopic(topic);

    const pushOptions = {
        urgency: 'high', // whether to send the notifications immediately or prioritize the recipient’s device power
        TTL: 7 * 24 * 60 * 60, // 7 days * 24 hours/day * 60 minutes/hour * 60 seconds/minute
        topic: topic,
    };

    try {
        const [subscriptionsFromDb] = await dbConnectionPool.execute(selectSubscriptionsSqlQuery, [cameraId, user_id]);

        const sendNotificationsPromises = subscriptionsFromDb.map(({ subscription }) => (
            webpush.sendNotification(
                subscription,
                JSON.stringify({ title, message, icon, timestamp }),
                pushOptions
            )
        ));

        errorMessage = 'Could not send notifications';

        const promiseResults = await Promise.allSettled(sendNotificationsPromises);

        let hasAnyPromiseRejected = false;
        const outdatedSubscriptionIds = [];

        promiseResults.forEach((promiseResult, index) => {
            if (promiseResult.status === 'rejected') {
                hasAnyPromiseRejected = true;

                /**
                 * Look up which HTTP status code for which Web Push errors:
                 * https://pushpad.xyz/blog/web-push-errors-explained-with-http-status-codes
                 */
                switch (promiseResult.reason?.statusCode) {
                    case 404: // the url endpoint of the push subscription is invalid
                    case 410: // the push subscription for this url endpoint is expired or no longer exists
                        const correspondingSubscriptionId = subscriptionsFromDb[index].subscription_id;
                        outdatedSubscriptionIds.push(correspondingSubscriptionId);
                        break;
                }
            }
        });

        const responseStatusCode = hasAnyPromiseRejected ? 500 : 201;
        res.status(responseStatusCode).json(promiseResults);

        if (outdatedSubscriptionIds.length === 0) {
            return;
        }

        // Delete outdated subscriptions
        const deleteOutdatedSubscriptionsSqlQuery = `
            DELETE FROM notification_subscription
            WHERE FK_camera_id = ? AND FK_user_id = ? AND subscription_id IN (?)
        `;

        /**
         * We use `.query()` instead of `.execute()` because `.execute()` does not support taking arrays or objects as parameter.
         * On the other hand, `.query()` does client side placeholders substitution and thus allows arrays and objects.
         * The explanation:
         * https://github.com/sidorares/node-mysql2/issues/1347
         * https://github.com/sidorares/node-mysql2/issues/553#issuecomment-437221838
         */
        try {
            await dbConnectionPool.query(deleteOutdatedSubscriptionsSqlQuery, [cameraId, user_id, outdatedSubscriptionIds]);
        } catch (e) {
            console.log('Exception caught in sendNotifications(): Could not delete outdated subscriptions:', e);
        }
    } catch (e) {
        console.log('Exception caught in sendNotifications():', e);
        res.status(500).json({ error: errorMessage });
    }
};

export const createSubscription = async (req, res) => {
    const { cameraId } = req.pisentryParams;
    const { user_id } = req.pisentryParams.authorizedUser;
    const { subscription } = req.body;

    const isSubscriptionAcceptable = typeof subscription === 'object' && typeof subscription?.endpoint === 'string';

    if (!isSubscriptionAcceptable) {
        return res.status(400).json({ error: 'Subscription must be a valid Push subscription' });
    }

    const jsonSubscription = JSON.stringify(subscription);

    const checkSubscriptionAlreadyExistSqlQuery = `
        SELECT subscription_id
        FROM notification_subscription
        WHERE JSON_EXTRACT(subscription, "$.endpoint") = ? AND FK_camera_id = ? AND FK_user_id = ?
    `;

    let errorMessage = 'Could not check if subscription already exist';

    try {
        const [checkSubscriptionAlreadyExistRows] = await dbConnectionPool.execute(
            checkSubscriptionAlreadyExistSqlQuery,
            [subscription.endpoint, cameraId, user_id]
        );

        const subscriptionAlreadyExist = checkSubscriptionAlreadyExistRows.length > 0;

        if (subscriptionAlreadyExist) {
            const existingSubscriptionId = checkSubscriptionAlreadyExistRows[0].subscription_id;

            const updateExistingSubscriptionSqlQuery = `
                UPDATE notification_subscription
                SET subscription = ?
                WHERE subscription_id = ? AND FK_camera_id = ? AND FK_user_id = ?
            `;

            errorMessage = 'Could not update existing subscription';

            const [updateExistingSubscriptionRows] = await dbConnectionPool.execute(
                updateExistingSubscriptionSqlQuery,
                [jsonSubscription, existingSubscriptionId, cameraId, user_id]
            );

            res.status(201).json({ subscription_id: existingSubscriptionId });

            return;
        }

        const insertSubscriptionSqlQuery = `
            INSERT INTO notification_subscription (subscription, FK_camera_id, FK_user_id) VALUES (?, ?, ?)
        `;

        errorMessage = 'Could not create subscription';

        const [insertSubscriptionRows] = await dbConnectionPool.execute(insertSubscriptionSqlQuery, [jsonSubscription, cameraId, user_id]);
        res.status(201).json({ subscription_id: insertSubscriptionRows.insertId });
    } catch (e) {
        console.log('Exception caught in createSubscription():', e);
        res.status(500).json({ error: errorMessage });
    }
};
