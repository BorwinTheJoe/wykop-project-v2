const express = require('express');
const router = express.Router();
const path = require ('path');

// Using regex to respond with the index.html file.
router.get('^/$|/index(.html)?', (req, res) => {
    res.sendFile(path.join(__dirname, "..", 'views', 'index.html'));
});

module.exports = router;