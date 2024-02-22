const express = require('express');
const app = express();
const path = require('path');
//importing logger method from logEvents.
const {reqlogger} = require('./middleware/logEvents');
const errorHandler = require('./middleware/errorHandler');

// Server port, or a Default port.
const PORT = process.env.PORT || 3500;

// logging requests.
app.use(reqlogger);

// middleware for handling url-encoded data
app.use(express.urlencoded({extended: false}));

// middleware for serving json.
app.use(express.json());

// middleware for serving static files, like css, from the public folder.
app.use(express.static(path.join(__dirname, '/public')));

// Using regex to respond with the index.html file.
app.get(`^/$|/index(.html)?`, (req, res) => {
    res.sendFile(path.join(__dirname, `views`, `index.html`));
});

// Responding with a custom 404 status page.
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