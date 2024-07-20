import User from "../models/user.model.js";
import Notification from "../models/notification.js";
import Post from "../models/post.model.js";
import {v2 as cloudinary} from "cloudinary"

export const createPost = async (req, res) =>{
    try {
        const {text} = req.body;
        let{img} = req.body;
        const userId = req.user._id.toString();

        const user = await User.findById(userId);

        if(!user) return res.status(404).json({message:"User not found"});
        if(!text) return res.status(404).json({message : "Blank can't be uploaded"});

        if(img){
            const uploadResponse = await cloudinary.uploader.upload(img);
            img = uploadResponse.secure_url;
        }

        const newPost = new Post({
            user: userId,
            text,
            img,

        })

        await newPost.save();
        console.log("New Post Uploaded Success")
        res.status(201).json({newPost});


    } catch (error) {
        console.log(error);
        res.status(500).json({error:"Error while uploading "});
    }
}

export const deletePost = async (req,res) => {
    try {
        const post = await Post.findById(req.params.id);
        if(!post) return res.status(404).json({error:"Post not found "});

        if(post.user.toString() !== req.user._id.toString()) {
            return res.status(404).json({error:"You are not allowed to delete"});
        }

        if(post.img){
            const imgId = post.img.split("/").pop().split(".")[0];
            await cloudinary.uploader.destroy(imgId);
        }

        await Post.findByIdAndDelete(req.params.id);

        res.status(200).json({Message : "Sucessfully deleted  "});
        console.log("delete Post successfully")

    } catch (error) {
        console.log(error);
        res.status(500).json({error:"Error while deleting "});
    }
}

export const commentonPost = async (req, res) => {
    try {
        const {text} = req.body;
        const PostId = req.params.id;
        const userId = req.user._id;

        if(!text) {
            return res.status(404).json({error : "text is required "});
        }

        const post = await Post.findById(PostId);

        if(!post) {
            return res.status(404).json({error : "Post not found "});
        }

        const comment = {user : userId , text};

        post.comments.push(comment);

        await post.save();
        const upDatedComments = post.comments;

        res.status(200).json({upDatedComments});
        console.log("Comemnt Added !!");

    } catch (error) {
        console.log(error);
        return res.status(500).json({error:"Error while commenting "});
    }
}

export const likeUnlikePost = async (req, res) => {
    try {
        const userId = req.user._id;
        const {id:postId} = req.params;

        const post = await Post.findById(postId);

        if(!post) {
            return res.status(404).json({error:"Post not found"});
        }
        const userLikedPost = post.likes.includes(userId);

        if(userLikedPost){
            // unline the post 
            await Post.updateOne({_id: postId}, {$pull: {likes: userId}});
            await User.updateOne({_id: userId}, {$pull: { likedPost: postId}});
            const updatedLikes = post.likes.filter((id) => id.toString() !== userId);

            res.status(200).json({updatedLikes});
            console.log("Unliked post");
        }else{
            // Like post and send notification
            post.likes.push(userId);
            await User.updateOne({_id: userId}, {$push: { likedPost : postId}});
            await post.save();

            const notification = new Notification({
                from : userId,
                to : post.user,
                type : "like",
            })
            if(notification.from.toString()  === notification.to.toString()) {
                
            }else{
                 await notification.save();
            }
            const updatedLikes = post.likes;
            res.status(200).json(updatedLikes);
            console.log("Liked Post ");
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({error : "Error while Liking the post "})
    }
}

export const getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find().sort({createdAt : -1}).populate({
            path : 'user',
            select : "-password"
            
        }).populate({
            path: 'comments.user',
            select: '-password'
        });
        if(posts.length === 0) {
            return res.status(404).json({error : "No posts found"});
        }

        res.status(200).json(posts);
       
        
    } catch (error) {
        console.log(error);
        res.status(500).json({error : "Error while Fetching Posts"});
    }
}

export const getLikedPosts =async (req, res) => {
    const userId = req.params.id;
    try {
        const user = await User.findById(userId);
        if(!user) {
            return res.status(404).json({message:"User not found"});
        }

        const LikedPosts = await Post.find({_id : {$in :user.likedPost}}).populate({
            path : "user",
            select: "-password"
        }).populate({
            path : 'comments.user',
            select: "-password"
        });

        res.status(200).json({LikedPosts})
        console.log(LikedPosts);
        
    } catch (error) {
        console.log(error);
        req.status(500).json({error : "Error while fetching Liekd Posts"}); 
    }
}

export const getfollowingPosts =async (req, res) =>{
    try {
        const userId = req.user._id;
        const user = await User.findById(userId);
        if(!user) return res.status(404).json({message:"User not found"});

        const following = user.following;

        const feedPosts =  await Post.find({user : {$in: following}})
        .sort({createdAt: -1}).populate({
            path: 'user',
            select: '-password'
        }).populate({
            path: 'comments.user',
            select: '-password'
        })

        res.status(200).json(feedPosts);

    } catch (error) {
        console.error(error);
        res.status(404).json({message:"Something went wrong"});
    }
}

export const getUserposts = async (req, res) => {
try {
    const {username} = req.params;
    const user = await User.findOne({username: username});

    if(!user) return res.status(404).json({message: 'User not found'});

    const posts = await Post.find({user : user._id})
    .sort({createdAt: -1})
    .populate({
        'path': 'user',
        select: '-password'
    })
    .populate({
        path: 'comments.user',
        select: '-password'
    })

    res.status(200).json({posts})



} catch (error) {
    console.log(error);
    res.status(404).json({message:"Something went wrong"});
}
}