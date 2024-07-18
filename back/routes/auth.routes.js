import express from 'express';
import {signup , login, logout , getMe} from './../controllers/auth.controllers.js'
import { protectRoute } from '../middleware/protect.route.js';


const router = express.Router();

router.get('/me',protectRoute, getMe); 

router.post('/signup', signup);

router.post('/login', login);

router.post('/logout',logout);


export default router;