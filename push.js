import webpush from 'web-push';
import config from './config/config.js';

const { vapidPublicKey, vapidPrivateKey } = config;

const vapidDetails = {
    subject: 'https://pisentry.app',
    publicKey: vapidPublicKey,
    privateKey: vapidPrivateKey,
};

webpush.setVapidDetails(vapidDetails.subject, vapidDetails.publicKey, vapidDetails.privateKey);

const devicePushSubscription = {
    // "endpoint": "",
    // "expirationTime": null,
    // "keys": {
    //     "p256dh": "",
    //     "auth": ""
    // }
};

const payload = 'Hello hello payload';

const options = {
    urgency: 'high', // whether to send the notification immediately or prioritize the recipient’s device power
    TTL: 604800, // 7 days in seconds
    topic: 'newdetection',
};

webpush.sendNotification(devicePushSubscription, payload, options);
