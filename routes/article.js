const express = require('express');
const router = express.Router();
const articleController = require('../controllers/registerController');

router.post('/', articleController.handleNewArticle);

module.exports = router;