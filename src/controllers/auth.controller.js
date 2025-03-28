import { ApiError } from "../utils/customResponse/ApiError.js";
import { ApiResponse } from "../utils/customResponse/ApiResponse.js";
import { User } from "../models/user.model.js";
import { checkPasswordStrength } from "../utils/others/checkPasswordStrength.js";

// register user controller
export const registerUser = async (req, res, next) => {
    try {
        const { fullName, email, dob, phone, address, password } = req.body;

        if (!fullName || !dob || !address || !email || !phone || !password) {
            return res
                .status(401)
                .json(new ApiError(401, "All fields are required"));
        }

        const isPasswordStrong = checkPasswordStrength(password);

        if (!isPasswordStrong) {
            return res
                .status(402)
                .json(
                    new ApiError(
                        402,
                        "Password must be strong: at least 6 characters, including one uppercase letter, one lowercase letter, one number, and one symbol."
                    )
                );
        }

        const existedUser = await User.findOne({
            $or: [{ email }, { phone }],
        });

        if (existedUser) {
            return res
                .status(409)
                .json(
                    new ApiError(409, "User with this email already exists.")
                );
        }

        const user = await User.create({
            fullName,
            email,
            phone,
            dob,
            address,
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

// login user controller
export const loginUser = async (req, res, next) => {
    try {
        // get the email password
        // check if the password is correct
        // create session token and save it to the db
        // log in the user
    } catch (error) {
        console.error(`Internal Server Error : ${error}`);
        return next(new ApiError(500, "Server error logging user in."));
    }
};
