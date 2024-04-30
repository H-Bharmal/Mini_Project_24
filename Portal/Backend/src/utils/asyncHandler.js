import { ApiResponse } from "./ApiResponse.js";

function asyncHandler(func){
    return async function (req, res, next) {
        try {
            await func(req, res, next);
        } catch (error) {
            console.log(error);
            res.status(error.statusCode || 500).json(new ApiResponse(error.statusCode || 500, {error : error}, error.message));
        }
    }
}

// const asyncHandler = (requestHandler)=>{
//     return (req, res, next)=>{
//         Promise
//         .resolve(requestHandler(req, res, next))
//         .catch((error)=>{
//             next(error)
//         })
//     }
// }

export {asyncHandler}