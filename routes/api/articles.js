const express = require('express');
const router = express.Router();
const articleController = require('../../controllers/articleController');
const ROLES_LIST = require('../../config/roles_list');
const verifyRoles = require('../../middleware/verifyRoles');

router
    .route('/')
    .get(verifyRoles(ROLES_LIST.Admin), articleController.getAllArticles)
    .delete(verifyRoles(ROLES_LIST.Admin), articleController.deleteArticle)
    .post(verifyRoles(ROLES_LIST.User), articleController.handleNewArticle);

router.route('/:id').get(verifyRoles(ROLES_LIST.Admin), articleController.getArticle);

module.exports = router;