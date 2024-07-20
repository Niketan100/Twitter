import {v2 as cloudinary} from 'cloudinary'

import User from "../models/user.model.js";
import brcypt from 'bcryptjs';
import Notification from "../models/notification.js";



export const getUserProfile = async (req,res) =>{
    const {username} = req.params;

    try {   
        const user = await User.findOne({username: username }); 
        if(!user) return res.status(404).json({message: "User not found" });
        res.status(200).json(user);
        
    } catch (error) {
        console.log("Error in getUserProfile", error);
        res.status(500).json({error: error});
    }
}

export const followUnfolloweUser = async (req,res) =>{

    try {
        const {id} = req.params;
        const userToModify = await User.findById(id);
        const currentUser = await User.findById(req.user._id);
        if(id === req.user._id.toString()) {
            return res.status(400).json({error:"Can't Follow yourself"}); 
        }
        
        if(!userToModify || !currentUser) {
            return res.status(404).json({error: "User Not Found!"})
        }
        // check if user already follows
        const isFollowing = currentUser.following.includes(id);
        if(isFollowing) {
            // if already folows then remove from the list
            await User.findByIdAndUpdate(id, {$pull : {followers : req.user._id}});
            await User.findByIdAndUpdate(req.user._id , {$pull : {following : id}});
            
            // send notification over operations
            res.status(200).json({message : "Unfollowed successfully"})
        }else{

            // follow the user
            await User.findByIdAndUpdate(id, { $push : {followers :req.user._id }});
            await User.findByIdAndUpdate(req.user._id, { $push : {following :id}});

            const newNotification = new Notification({
                            type : "follow",
                            from: req.user._id,
                            to : id,                
                        });
                        await newNotification.save();

            res.status(200).json({message : "Followed successfully"})   
        }

    } catch (error) {
        console.log(error);
    }
}  

export const getsuggestedUsers = async (req, res) => {
    try {
        
        const userId = req.user.id;
        const userFollowedByMe = await User.findById(userId).select('following').where('following');


        const users = await User.aggregate([
            {
                $match:{
                    _id: {$ne: userId}
                }
            },
            {$sample:{size: 10}}
        ])
        // users i follow and they also follow me 
        const filteredUsers = users.filter(user=>!userFollowedByMe.following.includes(user._id));
        const suggestedUsers = filteredUsers.slice(0,4);

        suggestedUsers.forEach(user=>(user.password = null));

        res.status(200).json(suggestedUsers);

    } catch (error) {
        
    }
}

export const updateUserProfile = async (req, res) =>{
    const{fullName , email , username , currentPassword , newPassword , bio, link} = req.body;
    let {profilePic , coverPic} = req.body;
    const userId = req.user._id;

    try {
        let user = await User.findById(userId);
        if(!user) return res.status(404).json({message : "User not found"});

        if(currentPassword && newPassword ){
            const isMatch = await brcypt.compare(currentPassword, user.password);
            if(!isMatch) return res.status(404).json({message : "Current password is incorrect"});
            
            const salt = await brcypt.genSalt(10);
            user.password = await brcypt.hash(newPassword, salt);


        }
        // changing profile pic if its being provided
        if(profilePic) {
           

            const uploadResponse = await cloudinary.uploader.upload(profilePic);
            profilePic = uploadResponse.secure_url;
        }
        // changing cover pic if it's being provided

        if(coverPic) {
            if(user.coverPic){
                await cloudinary.uploader.destroy(user.profilePic.split('/').pop().split('.')[0]); 
            }
            const uploadResponse = await cloudinary.uploader.upload(coverPic);
            coverPic = uploadResponse.secure_url;
        }

        user.fullName = fullName || user.fullName;
        user.email = email || user.email;
        user.username = username || user.username;
        user.Bio = bio || user.Bio;
        user.link = link || user.link;
        user.profilePic = profilePic || user.profilePic;
        user.coverPic = coverPic || user.coverPic;

        user = await user.save();

        res.status(200).json({message: "Updated Successfully"})
        console.log("Updated Successfully");


        } catch (error) {
        console.log(error.message);
    }
}