<h1 align="center">
   PiSentry Backend API
</h1>

## Table of Contents

1. [Run the API](#run-api)
2. [Technologies](#technologies)
3. [License](#license)

## <a name="run-api"></a>Run the API

#### 1. Set correct URLs

Because the API interacts with another PiSentry project, the PiSentry Camera Software, you might want to check the URL of the camera API in `config/config.js` and adapt it if necessary.

#### 2. Set correct environment variables

Create a `.env` file based on `.env.example` and set values that work for you.

For `VAPID_..._KEY` variables, you can use the [Web-Push](https://github.com/web-push-libs/web-push?tab=readme-ov-file#generatevapidkeys) library to generate VAPId keys if needed. 

#### 3. HTTPS support _(optional)_

To be able to run the API in HTTPS, simply uncomment and set your own correct values for the HTTPS env variables.
The paths to the files provided in `HTTPS_KEY` and `HTTPS_CERT` variables are always resolved from the `https_certificates/` directory. Place your HTTPS certificates in this directory.

If you need to generate self-signed HTTPS certificates, you can use [mkcert](https://github.com/FiloSottile/mkcert).

If HTTPS was set up properly, you will see the HTTPS server started in the console logs when starting the API.

#### 4. Run the API

There are 2 different ways to run the application, depending on what you want to achieve:
1. To develop the app: Execute `npm run dev` and the server will start and automatically reload when saving new changes.
2. To run the app in production: Execute `npm start` or `pm2 start pm2.config.cjs` to let pm2 manage it for you (you need to have pm2 installed).

## <a name="technologies"></a>Technologies

The API has been developed with Express.js.

The main libraries used are :
- [MySQL2](https://sidorares.github.io/node-mysql2/docs) - for interacting with the MySQL database
- [Web-Push](https://github.com/web-push-libs/web-push) - for sending push notifications to the PiSentry app

## <a name="license"></a>License

This project is licensed under the MIT License
