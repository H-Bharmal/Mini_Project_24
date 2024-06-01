import {Router} from "express"
import { registerUser, loginUser, logoutUser } from "../controllers/user.controller.js";
import { verifyJWTUser } from "../middlewares/auth.middleware.js";

const userRouter = Router();

userRouter.route("/registerUser").post(registerUser);
userRouter.route("/loginUser").post(loginUser);
userRouter.route("/logoutUser").post(verifyJWTUser, logoutUser);
export {userRouter}