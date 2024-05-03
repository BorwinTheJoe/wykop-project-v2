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


    //Delete article using Body instead of Params. Why??
    const requestedId = req.body.id;
    //Filter IDs which aren't 24 chars and 0-9 a-f or crash.
    if (requestedId.length != 24 || !/[a-f0-9]{24}/.test(requestedId)) {
        return res.status(400).json({ message: 'Article ID has to be 24 characters long and be made up of hexadecimal characters.'});
    }

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
    
    const requestedId = req.params.id;
    //Filter IDs which aren't 24 chars and 0-9 a-f or crash.
    if (requestedId.length != 24 || !/[a-f0-9]{24}/.test(requestedId)) {
        return res.status(400).json({ message: 'Article ID has to be 24 characters long and be made up of hexadecimal characters.'});
    }

    const article = await Article.findById(req.params.id).exec();
    if (!article) {
        return res.status(204).json({ message: `Article ID ${req.params.id} not found.`});
    }
    res.json(article);
};

// ------------------------//

const editArticle = async (req, res) => {
    if (!req?.body?.id) return res.status(400).json({ message: 'Article ID required.'});

    const requestedId = req.body.id;
    //Filter IDs which aren't 24 chars and 0-9 a-f, or crash.
    if (requestedId.length != 24 || !/[a-f0-9]{24}/.test(requestedId)) {
        return res.status(400).json({ message: 'Article ID has to be 24 characters long and be made up of hexadecimal characters.'});
    }

    const article = await Article.findById(requestedId).exec();
    if (article === null) {
        return res.status(204).json({ message: `Article ID ${requestedId} not found.`});
    }
    if (!verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Moderator)||article.author !== req.user) {
        return res.sendStatus(401);
    }

    try {
        console.log(`${req.body.title} | ${article.title}`);
        console.log(`${req.body.content} | ${article.content}`);
        console.log(`${req.body.tags} | ${article.tags}`);
        if (req.body?.title) article.title = req.body.title;
        if (req.body?.content) article.content = req.body.content;
        if (req.body?.tags) article.tags = req.body.tags;

        const result = await article.save();
        console.log(result);
        res.status(201).json({ message: `Article "${req.body.title}" updated!`});
    } catch (err) {
        res.status(500).json({ message: err.message});
    }
}

module.exports = { 
    handleNewArticle,
    getAllArticles,
    deleteArticle,
    getArticle,
    editArticle
};