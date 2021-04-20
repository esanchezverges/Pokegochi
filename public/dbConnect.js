const mongoose = require('mongoose');
mongoose.connect(process.env.DATABASE_URL, 
    {useUnifiedTopology: true, useNewUrlParser: true});
const db = mongoose.connection;
db.on('error', error => console.error("Couldnt connect, error: " +error));
db.once('open', () => console.log('Connected to Mongoose'));

module.exports = db;