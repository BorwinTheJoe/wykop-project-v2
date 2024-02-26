const Article = require('../model/Article');
const User = require('../model/User');
const jwt = require ('jsonwebtoken');

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
};

// ------------------------//

const editArticle = async (req, res) => {
    if (!req?.params?.id) return res.status(400).json({ message: 'Article ID required.'});

    const article = await Article.findOne({ _id: req.body.id}).exec();
    if (!article) {
        return res.status(204).json({ message: `Article ID ${req.params.id} not found.`});
    }
    // TODO: overwriting the contents and title of an Article.
    // Refuse to proceed with edit if title is a duplicate.
    // Note: Allow duplicate Titles and use ID's only?
    // Note: search methods based off keywords?
    // Note: Article Tags?
}

module.exports = { 
    handleNewArticle,
    getAllArticles,
    deleteArticle,
    getArticle,
    editArticle
};