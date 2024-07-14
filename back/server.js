import express from 'express';
import dotenv from 'dotenv'
import connectToDb from './db/connectionDb.js';
import authRoutes from './routes/auth.routes.js'


dotenv.config();

const app = express();
const port = 3000;

app.use('/api/auth', authRoutes);



app.listen(port , () =>{
    console.log(`Server working on port${port}`);
    connectToDb();
})