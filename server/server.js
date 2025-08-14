import cookieParser from 'cookie-parser';
import express from 'express';
import cors from 'cors';
import connectDb from './configs/db.js';
import 'dotenv/config'


const app = express();
const port = process.env.PORT || 4000;
await connectDb();

const allowedOrigin = ['http://localhost:5173'];




app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
    origin: allowedOrigin,
    credentials: true
}))


app.get('/', (req,res)=>{
res.send("API is Working")

})

app.listen(port,()=>{
    console.log(`Server is running on port ${port}`)
})
