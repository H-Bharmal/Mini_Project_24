import "dotenv/config"
import { dbConnect } from "./db/index.js";
import {app} from "./app.js"

dbConnect()
.then(()=>{
    app.listen(process.env.PORT || 8000, ()=>{
        console.log("Server Running at port :",process.env.PORT || 8000);
    })
})
.catch( (error)=>{
    console.log("Error while connecting to database");
    console.log(error);
})