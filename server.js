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

// Server port set in .env, or a Default port.
const PORT = process.env.PORT || 3500;

// Connecting to MongoDB
connectDB();

// logging requests.
app.use(reqlogger);

// Cross Origin Resource Sharing.
app.use(cors(corsOptions));

// middleware for handling url-encoded data
app.use(express.urlencoded({extended: false}));

// middleware for serving json.
app.use(express.json());

// middleware for serving static files, like css, from the public folder.
app.use(express.static(path.join(__dirname, '/public')));



// --- Routes! --- //

app.use('/', require('./routes/root'));

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

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));