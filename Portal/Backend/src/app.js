import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import { userRouter } from "./routes/user.route.js";

const app = express();

app.use(express.json({
    limit : "16kb"
}))

app.use(cookieParser());

app.use(cors());

app.use("/api/v1/user",userRouter)

app.get("/api/v1",(req,res)=>{
    res.status(200).
    json({data:"Api working"})
})
export {app}