import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"

const addressSchema = new mongoose.Schema({
    addressLine1 : {
        type : String,
        required : true,
    },
    addressLine2 : {
        type : String,
        required : false,
    },
    city : {
        type : String,
        required : true 
    },
    pincode : {
        type : Number,
        required : true 
    }
})
const userSchema = new mongoose.Schema({
        firstName : {
            type : String,
            lowercase : true,
            required : true
        },
        middleName : {
            type : String,
            lowercase : true
        },
        lastName : {
            type : String,
            lowercase : true,
            required : true
        },
        dob : {
            type : Date,
            required : true,
        },
        password : {
            type : String,
            required : [true, "password is required"],
        },
        email : {
            type : String,
            required : true,
            lowercase : true,
        },
        mobileNumber : {
            type : Number,
            required : true,
        },
        refreshToken : {
            type : String,
        },
        profilePicture : {
            type : String,      // cloudinary url
            default : null
        }
},
{timestamps : true});

userSchema.statics.encryptPassword = async function (next){
    // encrypt the password before saving
    // console.log("Password inside userSchema method", this.password);
    if(this.isModified("password")){
        this.password = await bcrypt.hash(this.password, 10);
    }
    // console.log(this);
    next();
};

userSchema.statics.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password);
}

// Web Token for login logout
userSchema.statics.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id : this._id,
        },
        
        process.env.REFRESH_TOKEN_SECRET, 
        
        {
            expiresIn : process.env.REFRESH_TOKEN_EXPIRY
        }
        )
}
userSchema.statics.generateAccessToken = function(){
    return jwt.sign(
        {
            _id : this._id,
            email : this.email
        },
        
        process.env.ACCESS_TOKEN_SECRET, 
        
        {
            expiresIn : process.env.ACCESS_TOKEN_EXPIRY
        }
        )
}
userSchema.statics.changePassword = async function(currentPassword, newPassword){
    // console.log("Inside userSchema changepassword method");
    // verify the passwords
    if(await this.isPasswordCorrect(currentPassword)){
        // Change the password
        this.password = newPassword ;
        await this.save();
        console.log("Verfication Success");
        return true;
    }
    else{
        // throw new ApiError(400, "Invalid Credentials !");
        return false;
    }
}


// const User = mongoose.model("User", userSchema);
export {userSchema};