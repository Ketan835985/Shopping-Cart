const { } = require('dotenv').config();


module.exports = {
    PORT: process.env.PORT,
    MONGO_URL: process.env.MONGO_URL,
    SECRET_KEY: process.env.SECRET_KEY,
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    AWS_REGION: process.env.AWS_REGION
}