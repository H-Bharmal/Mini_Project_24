import mongoose from "mongoose";
import { userSchema } from "./user.model.js";

const patientSchema = new mongoose.Schema({
    ...userSchema.obj,
    
    patientId : {
        // Say citizenship Id
        type : String,
        required : true,
        unique:true
    }
    
}, {timestamps:true});


patientSchema.pre('save', async function(next){
    await userSchema.statics.encryptPassword.call(this, next);
}
);
patientSchema.methods.generateRefreshToken = function(){
    return userSchema.statics.generateRefreshToken.call(this);
}
patientSchema.methods.generateAccessToken = function(){
    return userSchema.statics.generateAccessToken.call(this);
}
patientSchema.methods.isPasswordCorrect = function(password){
    return userSchema.statics.isPasswordCorrect.call(this, password);
}
patientSchema.methods.changePassword = async function(currentPassword, newPassword){
    // console.log("Inside patientSchema changepassword method");

    return await userSchema.statics.changePassword.call(this, currentPassword, newPassword);
}


export const Patient = mongoose.model("Patient",patientSchema);