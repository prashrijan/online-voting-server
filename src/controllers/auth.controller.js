import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";

// register user controller
export const registerUser = async (req, res, next) => {
    try {
        const { userName, email, password } = req.body;

        if (!userName || !email || !password) {
            return res
                .status(401)
                .json(new ApiError(401, "All fields are required"));
        }

        const existedUser = await User.findOne({
            $or: [{ email }, { userName }],
        });

        if (existedUser) {
            return res
                .status(409)
                .json(
                    new ApiError(
                        409,
                        "User with this email or username already exists."
                    )
                );
        }

        const user = await User.create({
            userName,
            email,
            password,
        });

        const createdUser = await User.findById(user._id).select("-password");

        return res
            .status(201)
            .json(
                new ApiResponse(201, createdUser, "User successfully created.")
            );
    } catch (error) {
        console.error(`Internal Server Error : ${error}`);
        return next(new ApiError(500, "Server error registering user."));
    }
};
