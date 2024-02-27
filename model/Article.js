const mongoose = require('mongoose');
const Schema = mongoose.Schema;


// Note: can shorten type to just "name": "Type" from "name": { type: "Type"} where it's the only setting.
const articleSchema = new Schema({
    author: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now,
        required: true
    },
    tags: [
        {
            tag: {
                type: String
            }
        }
    ],
    comments: [
        {
            author: {
                type: String
            },
            body: {
                type: String
            },
            date: {
                type: Date,
                default: Date.now
            }
        }
    ],
    hidden: {
        type: Boolean,
    },
    meta: {
        votes: {
            type: Number,
            default: 0
        },
        favs: {
            type: Number,
            default: 0
        }
    }
});

module.exports = mongoose.model('Article', articleSchema);