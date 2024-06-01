import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiResponse} from "../utils/ApiResponse.js"
import { cookieOptions } from "../constants.js";

const generateAccessAndRefreshToken =async function(_id){
    console.log("Generating access and refresh token");
    try{
        const user = await User.findById(_id);
        
        const refreshToken =await user.generateRefreshToken();
        const accessToken =await user.generateAccessToken();
        // console.log(refreshToken, accessToken);
        user.refreshToken = refreshToken ;

        await user.save({validateBeforeSave : false});
        console.log("Generation Complete access and refresh token");
        return {refreshToken, accessToken};
    }
    catch(error){
        console.log(error);
        throw new ApiError(500, "Error generating access and refresh token", [error])
    }
}

const registerUser = asyncHandler( async (req, res, next)=>{
    let 
    firstName,middleName, lastName,
    dob, password, email, mobileNumber,
    role;

    firstName = req.body.firstName?.trim() ;
    middleName = req.body.middleName?.trim() ;
    lastName = req.body.lastName?.trim() ;
    dob = req.body.dob ;
    password = req.body.password?.trim() ;
    email = req.body.email?.trim() ;
    mobileNumber = req.body.mobileNumber ;
    role = req.body.role ;

    if((isNaN(mobileNumber) && !email) || !firstName ){
        throw new ApiError(400, "Parameters required");
    }
    if(!password){
        throw new ApiError(400, "Password Required !");
    }
    if(!role){
        throw new ApiError(400, "Role Required");
    }
    //check if user does exist
    const existUser = await User.findOne({
        $or : [{mobileNumber}, {email}]
    })

    if(existUser){
        throw new ApiError(400, "User Already Exists")
    }
    const createdUser = await User.create({
        firstName, middleName, lastName, dob, password, email, mobileNumber, role
    });

    if(!createdUser){
        throw new ApiError(500, "Error registering User");
    }

    res.status(200)
    .json(new ApiResponse(200, createdUser, "User Created Successfully"))
    
})

const loginUser = asyncHandler ( async(req, res, next)=>{
    
    const {password, email, mobileNumber} = req.body ;

    if(!password) throw new ApiError(400, "All fields are required !");

    if(!email && !mobileNumber) throw new ApiError(400, "All fields are required !");

    // check if user exists
    const user = await User.findOne({
        $or : [{email}, {mobileNumber : (isNaN(mobileNumber) ? -1 : mobileNumber)}]
    })

    if(!user) throw new ApiError(400, "User is not registered !")

    // check if password is valid
    if(! await user.isPasswordCorrect(password)) throw new ApiError(400, "Invalid Credentials");

    // Create refresh and access token
    const {refreshToken, accessToken} =await generateAccessAndRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");


    return res.status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(new ApiResponse(200, loggedInUser, "Logged In Successful !"));
})

const logoutUser = asyncHandler( async(req, res, next)=>{
        // Check for if user is loggedIn is done by middleware

        if(!req.user) throw new ApiError("Unauthorized Access");

        const user = req.user ;
        await User.findByIdAndUpdate(user._id, {
            $set : {refreshToken : "undefined"}
        }, {new : true})
    
        res.status(200)
        .clearCookie("accessToken", cookieOptions)
        .clearCookie("refreshToken", cookieOptions)
        .json(new ApiResponse(200,{}, "LogOut Successful"));
})
export {generateAccessAndRefreshToken, registerUser, loginUser, logoutUser}