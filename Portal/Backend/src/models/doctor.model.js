import mongoose from "mongoose";
import { userSchema } from "./user.model.js";

const docotorSchema = new mongoose.Schema({
    ...userSchema.obj,
    
    doctorId : {
        // Eg. D1
        type : String,
        required : true,
        unique:true
    }
    
}, {timestamps:true});


doctorSchema.pre('save', async function(next){
    await userSchema.statics.encryptPassword.call(this, next);
}
);
doctorSchema.methods.generateRefreshToken = function(){
    return userSchema.statics.generateRefreshToken.call(this);
}
doctorSchema.methods.generateAccessToken = function(){
    return userSchema.statics.generateAccessToken.call(this);
}
doctorSchema.methods.isPasswordCorrect = function(password){
    return userSchema.statics.isPasswordCorrect.call(this, password);
}
doctorSchema.methods.changePassword = async function(currentPassword, newPassword){
    // console.log("Inside doctorSchema changepassword method");

    return await userSchema.statics.changePassword.call(this, currentPassword, newPassword);
}


export const Doctor = mongoose.model("Doctor",doctorSchema);