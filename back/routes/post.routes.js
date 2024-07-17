import express from 'express';
import { protectRoute , } from '../middleware/protect.route.js';

import { createPost ,deletePost, commentonPost, likeUnlikePost, getAllPosts, getLikedPosts, getfollowingPosts, getUserposts} from '../controllers/post.controller.js';

const router = express.Router();
router.get('/user/:username', protectRoute, getUserposts);
router.get('/following', protectRoute, getfollowingPosts);
router.get('/liked/:id', protectRoute, getLikedPosts);
router.get('/all', protectRoute, getAllPosts);
router.post('/create', protectRoute, createPost);
router.post('/like/:id', protectRoute, likeUnlikePost);
router.post('/comment/:id',protectRoute,commentonPost);
router.delete('/delete/:id', protectRoute , deletePost);



export default router;