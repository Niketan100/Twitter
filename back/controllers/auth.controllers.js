import User from './../models/user.model.js'
import { genrateTokenAndSetcookie } from '../lib/utils/genToken.js';
import bcrypt from 'bcryptjs';
import { response } from 'express';

export const signup = async(req, res) => {
    try {
        const { fullName, username, email, password } = req.body;
      



        // checking for existing username
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ error: "Username is Taken" });
        }

        // checking if email is taken 
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ error: "Email is already Taken!" });
        }

        // hashing the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            fullName,
            username,
            email,
            password: hashedPassword
        });

        await newUser.save();
        genrateTokenAndSetcookie(newUser._id, res);

        return res.status(201).json({
            _id: newUser._id,
            fullName: newUser.fullName,
            username: newUser.username,
            email: newUser.email,
            followers: newUser.followers,
            following: newUser.following,
            profilePic: newUser.profilePic,
            coverPic: newUser.coverPic,
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

export const login = async(req, res) =>{
    try {
        const {username, password} = req.body;

        if(!username) return res.status(404).json({ error:"USername Can't be empty" }); 
        if(!password) return res.status(404).json({ error:"Password Can't be empty" });
        const user = await User.findOne({ username});
        const isPasswordCorrect = await bcrypt.compare(password, user?.password|| "")
        

        if(!user || !isPasswordCorrect){
            return res.status(400).json({ error: "Invalid username or password"});
        }
        // set Cookie as username and password are correct 
        genrateTokenAndSetcookie(user._id, res);

        res.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            username: user.username,
            email: user.email,
            following: user.following,
            followers:  user.followers,
            profilePic: user.profilePic,
            coverPic: user.coverPic
        })



    } catch (error) {
        res.json({ error: error.message });
    }

}

export const logout = async(req,res) =>{
    try {
        res.cookie("jwt","", {maxAge: 0});
        res.status(200).json({"message": "Logout successfully"})     
    } catch (error) {
        res.status(404).json({ error: error.message });
    }

}
  

export const getMe = async (req,res) =>{
    try {
        const user = await User.findById(req.user._id).select("-password");
        res.status(200).json({user: user});

    } catch (error) {
        res.status(404).json({ error: error.message});
    }
}