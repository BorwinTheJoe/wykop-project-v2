const User = require('../model/User');
const jwt = require('jsonwebtoken');

const handleRefreshToken = async (req, res) => {
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(401);
    const refreshToken = cookies.jwt;

    //Secure to False solely because thunderbird doesn't take itself as secure.
    res.clearCookie('jwt', {
        httpOnly: true,
        sameSite: 'None',
        secure: false
    });

    const foundUser = await User.findOne({ refreshToken }).exec();

    // Detected refresh token Reuse!
    if (!foundUser) {
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, decoded) => {
            if (err) return res.sendStatus(403); // Forbidden
            const hackedUser = await User.findOne({ username: decoded.username }).exec();
            hackedUser.refreshToken = []; // Empty user's cookie list when we find a token re-use.
            const result = await hackedUser.save();
            console.log(result);
        });
        return res.sendStatus(403); // Forbidden
    }

    const newRefreshTokenArray = foundUser.refreshToken.filter((rt) => rt !== refreshToken);

    // Evaluating JWT
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, decoded) => {
        if (err) {
            foundUser.refreshToken = [...newRefreshTokenArray];
            const result = await foundUser.save();
        }
        if (err || foundUser.username !== decoded.username) return res.sendStatus(403);

        // Refresh token was still valid
        const roles = Object.values(foundUser.roles);
        const accessToken = jwt.sign(
            {
                UserInfo: {
                    username: decoded.username,
                    roles: roles
                }
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '60s' }
        );

        const newRefreshToken = jwt.sign({ username: foundUser.username }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '1d' });

        // Saving refreshToken with current User. Later, Connect to database
        foundUser.refreshToken = [...newRefreshTokenArray, newRefreshToken];
        const result = await foundUser.save();

        // Create Secure cookie with refresh Token
        //Secure to False solely because thunderbird doesn't take itself as secure.
        res.cookie('jwt', newRefreshToken, {
            httpOnly: true,
            sameSite: 'None',
            secure: false,
            maxAge: 24 * 60 * 60 * 1000
        });

        res.json({ roles, accessToken });
    });
};

module.exports = { handleRefreshToken };