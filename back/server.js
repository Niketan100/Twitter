import express from 'express';
import dotenv from 'dotenv'
import connectToDb from './db/connectionDb.js';
import userRoutes from './routes/user.routes.js';
import authRoutes from './routes/auth.routes.js'
import postRoutes from './routes/post.routes.js'
import notificationRoutes from './routes/notification.routes.js'
import cookieParser from 'cookie-parser';
import {v2 as cloudinary}   from 'cloudinary'
import path from 'path';

import cors from 'cors'
dotenv.config();

cloudinary.config({
cloud_name: process.env.CLOUDINARY_CLOUD_NAME ,

api_key: process.env.CLOUDINARY_API_KEY ,
api_secret : process.env.CLOUDINARY_API_SECRET
})


const app = express();

const port = process.env.port || 3000;
const __dirname = path.resolve();


app.use(express.json({limit : "10mb"}));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/notifications', notificationRoutes);


if(process.env.NODE_ENV === 'production')
{
    app.use(express.static(path.join(__dirname, '/front/dist')));
    app.get('*', (req, res) =>{
        res.sendFile(path.resolve(__dirname, '/front/dist/index.html'));
    })
}


app.listen(port , () =>{
    console.log(`Server working on port${port}`);
    connectToDb();
})