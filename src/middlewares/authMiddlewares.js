const jwt = require('jsonwebtoken');
const userModels = require('../models/userModels');

const authMiddleware = async (req, res, next) => {
    const bearerToken = req?.headers?.authorization || ""
    try {
        if (bearerToken && bearerToken.startsWith("Bearer")) {
            const token = bearerToken.split(" ")[1]
            const jwtSecrete = process.env.JWT_SECRET_STRING || 'jwtsuperstrongsecretstring'
            const decodedToken = jwt.verify(token, jwtSecrete)
            const user = await userModels.findOne({ _id: decodedToken.id })
            if(user){
                req.user = user
                req.currentUserId = decodedToken.id
                return next()
               
            }
        }
        res.status(401).json({ success: false, message: "User token is expired or invalid, be sure to provide the correct token  or log in again" })

    } catch (error) {
        res.status(500).json({ success: false, message: "An error ocurred while verifying user=>" + error.message })
    }
}



const isAdmin = (req, res, next) => {
    try {
        const user = req.user
        const isAdmin = user.isAdmin
        if (isAdmin) {
            return next()
            
        }
        res.status(401).json({ success: false, message: "You don't have the admin privileges to perform this action" })
    } catch (error) {
        res.status(500).json({ success: false, message: "An error ocurred while verifying user=>" + error.message })
    }
}




module.exports = { authMiddleware, isAdmin }