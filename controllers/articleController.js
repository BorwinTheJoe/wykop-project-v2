const Article = require('../model/Article');
const User = require('../model/User');
const jwt = require ('jsonwebtoken');
const ROLES_LIST = require('../config/roles_list');
const verifyRoles = require('../middleware/verifyRoles');

const handleNewArticle = async (req, res) => {
    const {title, content} = req.body;
    if (!title || !content) return res.status(400).json({ message: 'Title and Content are required.'});

    const duplicate = await Article.findOne({ title: title}).exec();
    if (duplicate) return res.sendStatus(409);

    try {
        const result = await Article.create({
            title: title,
            content: content,
            author: req.user
            // How to define the author being the logged in person?
            // Potentially issues due to using the same variable name as model's data name
            // Try to update the author user's "posts" with the ID of THIS post?
            // Try to use Mongodb Auto _id's or to create own?
        });

        console.log(result);
        res.status(201).json({ message: `New Article "${title}" created!`});
    } catch (err) {
        res.status(500).json({ message: err.message});
    }
};

// ------------------------//

const getAllArticles = async (req, res) => {
    const articles = await Article.find();
    if (!articles) {
        return res.status(204).json({ message: 'No Articles Found.'});
    }
    res.json(articles);
};

// ------------------------//

const deleteArticle = async (req, res) => {
    if (!req?.body?.id) return res.status(400).json({ message: 'Article ID required'});

    const article = await Article.findOne({ _id: req.body.id}).exec();
    if (!article) {
        return res.status(204).json({ message: `Article ID ${req.body.id} not found`});
    }
    if (!verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Moderator)||article.author !== req.user) {
        return res.sendStatus(401);
    }
    const result = await article.deleteOne({ _id: req.body.id});
    res.json(result);
    // Get ID from front-end via button use?
    // Restrict deletion to either the Author, or a user with Moderator or Higher privilage.
};

// ------------------------//

const getArticle = async (req, res) => {
    if (!req?.params?.id) return res.status(400).json({ message: 'Article ID required.'});

    const article = await Article.findOne({ _id: req.params.id}).exec();
    if (!article) {
        return res.status(204).json({ message: `Article ID ${req.params.id} not found.`});
    }
    res.json(article);
    //For some reason, an ID that doesn't exist in the database tries to reply with the structure of the entire database.
};

// ------------------------//

const editArticle = async (req, res) => {
    if (!req?.params?.id) return res.status(400).json({ message: 'Article ID required.'});

    const article = await Article.findOne({ _id: req.body.id}).exec();
    if (!article) {
        return res.status(204).json({ message: `Article ID ${req.params.id} not found.`});
    }
    if (!verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Moderator)||article.author !== req.user) {
        return res.sendStatus(401);
    }

    if (req.body?.title) article.title = req.body.title;
    if (req.body?.content) article.content = req.body.content;
    if (req.body?.tags) article.tags = req.body.tags;

    const result = await article.save();
    res.json(result);
    // For some reason, the correctly called ID Returns code 204 without any additional message, but an un-existing ID tries to reply with the structure of the entire database.
}

module.exports = { 
    handleNewArticle,
    getAllArticles,
    deleteArticle,
    getArticle,
    editArticle
};