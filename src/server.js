import cors from "cors";
import express from "express";
const app = express();
import cookieParser from "cookie-parser"
import "dotenv/config"
const port = process.env.PORT;
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}))

// do connect
import dbConnect from './db/index.js'
// const runServer= async()=>{
//     await dbConnect();
//     app.listen(port, ()=>{
//         console.log(`port ${port} is assigned sucessfully`);
//     });
// }
// runServer();
// dbConnect().then(()=>{
//     app.listen(port, ()=>{
//         console.log(`port ${port} is assigned sucessfully`);
//     });
// })
dbConnect();
app.listen(port, () => {
    console.log(`port ${port} is assigned  sucessfully`);
});


// middlewares
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.json());
app.use(express.static('public'));


// routers
import compilerRouter from "./routers/compiler.router.js"
app.use("/api/v1/compiler", compilerRouter)
import questionRouter from "./routers/question.router.js"
app.use("/api/v1/question", questionRouter)
import contestRouter from "./routers/contest.router.js"
app.use("/api/v1/contest", contestRouter)


// error middleware
import errorMiddleware from './middlewares/errorMiddleware.js';
app.use(errorMiddleware);
