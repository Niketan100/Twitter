import express from 'express';
import { protectRoute } from '../middleware/protect.route.js';
import {getsuggestedUsers ,getUserProfile ,followUnfolloweUser,updateUserProfile } from '../controllers/user.controller.js'; 

 
const router = express.Router();

router.get('/profile/:username',protectRoute,getUserProfile);
router.get("/suggested",protectRoute, getsuggestedUsers);
router.post("/follow/:id" ,protectRoute, followUnfolloweUser);
router.post("/update", protectRoute, updateUserProfile);

export default router;
