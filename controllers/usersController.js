const User = require('../model/User');

const getAllUsers = async (req, res) => {
    const users = await User.find();
    if (!users) {
        return res.status(204).json({ message: 'No Users Found.'});
    }
    res.json(users);
};

const deleteUser = async (req, res) => {
    if (!req?.body?.id) return res.status(400).json({ message: 'User ID required'});

    // Add ID Filter for IDs which aren't 24 chars and made up of 0-9 a-f
    const user = await User.findOne({ _id: req.body.id}).exec();
    if (!user) {
        return res.status(204).json({ message: `User ID ${req.body.id} not found`});
    }
    const result = await user.deleteOne({ _id: req.body.id});
    res.json(result);
};

const getUser = async (req, res) => {
    if (!req?.params?.id) return res.status(400).json({ message: 'User ID required.'});

    const user = await User.findOne({ _id: req.params.id}).exec();
    if (!user) {
        return res.status(204).json({ message: `User ID ${req.params.id} not found.`});
    }
    res.json(user);
};

const editUser = async(req, res) => {
    if (!req?.body?.id) return res.status(400).json({ message: 'User ID required.'});
    if (!req?.body?.role) return res.status(400).json({ message: 'No Role to change.'});

    const user = await User.findOne({ _id: req.body.id}).exec();
    if (!user) {
        return res.status(204).json({ message: `User ID ${req.body.id} not found.`});
    }

    try {
        if (req.body.role === "Moderator") {
             if (user.roles.Moderator !== 420) { user.roles.Moderator = 420; } else { user.roles.Moderator = null}
            }
        if (req.body.roles === "Admin") {
             if (user.roles.user.roles.Admin !== 421) { user.roles.Admin = 421; } else { user.roles.Admin = null}
            }
    } catch (err) {
        res.status(500).json({ message: err.message});
    }
    res.json(user);
}

module.exports = {
    getAllUsers,
    deleteUser,
    getUser,
    editUser
}