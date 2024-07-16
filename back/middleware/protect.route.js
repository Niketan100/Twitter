import User from '../models/user.model.js'
import jwt from 'jsonwebtoken'



export const protectRoute = async (req, res, next) =>{
    try {
        // take token and check if exists
        console.log('Here Is verifiicaton starting...');
        const token = req.cookies.jwt;


        if(!token){
           return res.status(401).json({error: 'User not logged in'});
        }


        // decode the token if it is valid
        const decoded = jwt.verify(token ,"fxnywUBiSnNAwz3zSg/XtvGO2W5lkdQ2+l3MSiymnvQ=");

        console.log(decoded);
        if(!decoded){
            return res.status(401).json({error: 'User not Athognized'});
        }

        // if the token is valid it should have userId and use that id To access the user data and see if that user exists in database
        const user = await User.findById(decoded.userId).select("-password");
        if(!user){
            return res.status(404).json({error: "user not found"});
        }



        req.user = user;
        next();

    } catch (error) {
        res.status(500).json({"error": error.message});
    }
}