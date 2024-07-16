import express from 'express';
import dotenv from 'dotenv'
import connectToDb from './db/connectionDb.js';
import authRoutes from './routes/auth.routes.js'
import cookieParser from 'cookie-parser';
import cors from 'cors'
dotenv.config();

const app = express();

app.use(cors({
    origin : 'http://localhost:5173',
    credentials : true,
    
}))


const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api/auth', authRoutes);



app.listen(port , () =>{
    console.log(`Server working on port${port}`);
    connectToDb();
})