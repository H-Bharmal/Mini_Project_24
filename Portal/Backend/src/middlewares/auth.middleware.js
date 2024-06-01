// middleware to check if you are loggedIn

import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { cookieOptions } from "../constants.js";


const verifyJWTUser =asyncHandler(async function(req, res, next){
    console.log("Authorizing...");
    console.log(req?.cookies);
    let incomingAccessToken = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
    let incomingRefreshToken = req.cookies?.refreshToken || req.header("Authorization")?.replace("Bearer ", "");
    
    if(!incomingAccessToken && !incomingRefreshToken ) throw new ApiError(400, "Authorization Token missing !");

    const accessTokenExp =await jwt.decode(incomingAccessToken).exp * 1000; // Multiply by 1000 to convert seconds to milliseconds
    
    const currentTime = new Date().getTime();
    if (accessTokenExp < currentTime) {
        console.log("Access Token Expired, Generating New !");
        // Access token is expired,  generate new
        const decodedRefreshToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

        let user = await User.findById(decodedRefreshToken._id).select("-password");
        
        if(!user) throw new ApiError(400, "Invalid Refresh Token");
        
        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401,"Invalid Refresh Token");
        }
        
        const generatedTokens = await generateAccessAndRefreshToken(user._id)

        const renewedAccessToken = generatedTokens.accessToken
        const renewedRefreshToken = generatedTokens.refreshToken
        
    

        res
        .cookie("accessToken", renewedAccessToken, cookieOptions)
        .cookie("refreshToken", renewedRefreshToken, cookieOptions)

        user = await User.findById(decodedRefreshToken._id).select("-password -refreshToken");
        
        if(!user) throw new ApiError(400, "Error while fetching User details from database");
        
        req.user = user ;

        next();
    }
    else{
        // Find the user with the help of accessToken
        const decodedAccessToken = jwt.verify(incomingAccessToken, process.env.ACCESS_TOKEN_SECRET);
        console.log("Access Token Decrypted !");

        // From decoded token we get id and then from that we get user
        const user = await User.findById(decodedAccessToken._id).select("-password -refreshToken");

        if(!user){
            throw new ApiError(400, "Access Token Invalid")
        }
        req.user = user ;
        next();
    }
});

export {verifyJWTUser}