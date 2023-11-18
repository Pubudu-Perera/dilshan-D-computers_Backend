// this middleware is for protect & authenticate other routes in the system as well. ex-: /notes & /users
// Methods in authController for /auth path only

const jwt = require('jsonwebtoken');

const verifyJWT = (req, res, next) => {

    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({message : "Unauthorized"});
    }

    const token = authHeader.split(' ')[1];   //0 element is Bearer & 1st element is the access token

    jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET,
        (err, decoded) => {
            if (err) {
                return res.status(403).json({message : "Forbidden"});
            }

            req.user = decoded.UserInfo.username;
            req.roles = decoded.UserInfo.roles;
            next();
        }
    )
}

module.exports = verifyJWT;