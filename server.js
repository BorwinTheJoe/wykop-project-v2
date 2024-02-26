// .env contains link to mongodb; Also contains the Secret for Access and Refresh Tokens.
require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
const corsOptions = require('./config/corsOptions');
//importing request logger method from logEvents, and error handler from it's own js file.
const {reqlogger} = require('./middleware/logEvents');
const errorHandler = require('./middleware/errorHandler');

//importing method for connecting to the Database.
const connectDB = require('./config/dbConn');
const mongoose = require('mongoose');

//importing cookie parser and credentials options.
const credentials = require('./middleware/credentials');
const cookieParser = require('cookie-parser');

//Importing middleware for handling verifying Json Web Tokens.
const verifyJWT = require('./middleware/verifyJWT');

// Server port set in .env, or a Default port.
const PORT = process.env.PORT || 3500;

// ---- END OF IMPORTS! ---- //

// Connecting to MongoDB
connectDB();

// logging requests.
app.use(reqlogger);

// Handle options Credentials check and fetch cookies credentials req.
app.use(credentials);

// Cross Origin Resource Sharing.
app.use(cors(corsOptions));

// middleware for handling url-encoded data
app.use(express.urlencoded({extended: false}));

// middleware for serving json.
app.use(express.json());

app.use(cookieParser());

// middleware for serving static files, like css, from the public folder.
app.use(express.static(path.join(__dirname, '/public')));


// --- Routes! --- //

app.use('/', require('./routes/root'));
app.use('/register', require('./routes/register'));
app.use('/auth', require('./routes/auth'));
app.use('/refresh', require('./routes/refresh'));
app.use('/logout', require('./routes/logout'));

// Routes only accessible if you have the access token. //
app.use(verifyJWT);
app.use('/users', require('./routes/api/users'));
app.use('/articles', require('./routes/api/articles'));


// Responding with a custom 404 status page if nothing before caught this.
app.all('*', (req, res) => {
    res.status(404);
    if (req.accepts('html')) {
        res.sendFile(path.join(__dirname, 'views', '404.html'));
    } else if (req.accepts('json')) {
        res.json({ error: '404 Not Found' });
    } else {
        res.type('txt').send('404 Not Found');
    }
});

app.use(errorHandler);

mongoose.connection.once('open', () => {
    console.log('connected to MongoDB');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});