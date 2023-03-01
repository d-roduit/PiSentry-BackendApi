module.exports = {
  apps: [{
    name: 'PiSentry-BackendApi',
    script: './server.js',
    node_args : '-r dotenv/config', // Use environment variables declared in .env file
  }],
};