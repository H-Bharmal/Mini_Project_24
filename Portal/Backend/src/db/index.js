import mongoose from "mongoose";

// File to connect the database
const dbConnect = async function(){
    try{
        await mongoose.connect(`${process.env.MONGO_URI}/${process.env.MONGODB_NAME}`);
        console.log("Database Connection Successful");
    }
    catch(error){
        console.log("Could Not connect to the database");
        console.log(error);
        process.exit(1);
    }
}

export {dbConnect};