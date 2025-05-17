import { ApiError } from "../utils/customResponse/ApiError.js";
import { ApiResponse } from "../utils/customResponse/ApiResponse.js";
import { User } from "../models/user.model.js";
import { Session } from "../models/session.model.js";
import { checkPasswordStrength } from "../utils/others/checkPasswordStrength.js";
import { conf } from "../conf/conf.js";
import { sendVerificationEmail } from "../utils/nodemailer/sendVerificationEmail.js";
import jwt from "jsonwebtoken";
import { sendResetPasswordEmail } from "../utils/nodemailer/sendResetPasswordEmail.js";

// generate access and refresh token
const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        user.refreshToken = refreshToken;

        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        console.log(error);
        throw new ApiError(
            500,
            "Something went wrong while generating referesh and access token"
        );
    }
};

// register user controller
export const registerUser = async (req, res, next) => {
    try {
        const { fullName, email, password, confirmPassword, bio } = req.body;

        if (!fullName || !email || !password || !confirmPassword || !bio) {
            return res
                .status(400)
                .json(new ApiError(400, "All fields are required"));
        }

        if (confirmPassword !== password) {
            return res
                .status(400)
                .json(new ApiError(400, "Passwords do not match"));
        }

        const isPasswordStrong = checkPasswordStrength(password);

        if (!isPasswordStrong) {
            return res
                .status(422)
                .json(
                    new ApiError(
                        402,
                        "Password must be strong: at least 6 characters, including one uppercase letter, one lowercase letter, one number, and one symbol."
                    )
                );
        }

        const existedUser = await User.findOne({
            email,
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
            password,
            bio,
            profileImage:
                "https://res.cloudinary.com/dlgvqwvwg/image/upload/v1746247834/donut_zn2hsx.png",
        });

        await sendVerificationEmail(user);

        const createdUser = await User.findById(user._id).select("-password");

        return res
            .status(201)
            .json(
                new ApiResponse(
                    201,
                    createdUser,
                    "User registered successfully. Please verify your email."
                )
            );
    } catch (error) {
        console.error(`Internal Server Error : ${error}`);
        return next(new ApiError(500, "Server error registering user."));
    }
};

// verify email
export const verifyEmail = async (req, res, next) => {
    try {
        const { token } = req.body;

        if (!token)
            return res.status(400).json(new ApiError(400, "Token missing."));

        const decoded = jwt.verify(token, conf.emailSecret);

        const user = await User.findById(decoded.id);

        if (!user)
            return res.status(400).json(new ApiError(404, "User not found."));

        if (user.isVerified) {
            return res
                .status(400)
                .json(new ApiError(400, "Email already verified."));
        }

        user.isVerified = true;

        await user.save();

        res.status(200).json(
            new ApiResponse(
                200,
                {
                    token,
                    user,
                },
                "Email verified successfully."
            )
        );
    } catch (error) {
        console.error(`Internal Server Error : ${error}`);
        return next(new ApiError(500, "Server error verifing email."));
    }
};

// login user controller
export const loginUser = async (req, res, next) => {
    try {
        // get the email password
        const { email, password } = req.body;

        if (!email || !password) {
            return res
                .status(401)
                .json(new ApiError(401, "All fields are required"));
        }

        // check if user exists
        const user = await User.findOne({ email });

        if (!user) {
            return res
                .status(404)
                .json(new ApiError(404, "User with this email doesnot exist."));
        }

        if (!user.isVerified) {
            return res
                .status(400)
                .json(
                    new ApiError(
                        400,
                        "Please verify your email before logging in."
                    )
                );
        }

        const isPasswordCorrect = await user.isPasswordCorrect(password);

        // check if the password is correct
        if (!isPasswordCorrect) {
            return res.status(401).json(new ApiError(401, "Invalid Password."));
        }
        // create tokens
        const { accessToken, refreshToken } =
            await generateAccessAndRefreshToken(user._id);
        // create session token and save it to the db
        const session = await Session.create({
            token: accessToken,
            associate: user.email,
        });

        if (!session) {
            return res
                .status(500)
                .json(new ApiError(500, "Failed to create session token."));
        }

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken },
                    "Login Successful."
                )
            );
    } catch (error) {
        console.error(`Internal Server Error : ${error}`);
        return next(new ApiError(500, "Server error logging user in."));
    }
};

// google login controller
export const googleAuthCallback = async (
    accessToken,
    refreshToken,
    profile,
    done
) => {
    try {
        const { id, displayName, emails } = profile;
        const email = emails[0].value;
        const fullName = displayName;
        const profileImage =
            profile.photos[0].value ||
            "https://res.cloudinary.com/dlgvqwvwg/image/upload/v1746247834/donut_zn2hsx.png";

        let user = await User.findOne({ email });

        // LOCAL ACCOUNT ALREADY EXISTS WITHOUT GMAIL
        if (user && !user.googleId) {
            console.log(
                "User exists but has no Google ID. Triggering failure."
            );
            return done(null, false, {
                message: "Email already registered. Use regular login.",
            });
        }

        if (!user) {
            user = await User.create({
                fullName,
                email,
                profileImage,

                password: null,
                googleId: id,
                isVerified: true,
            });
        }

        return done(null, user);
    } catch (error) {
        console.error("Error in Google login callback:", error);
        return done(error, null);
    }
};

export const loginSuccess = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json(new ApiResponse("Not Authorized"));
        }

        const user = req.user;

        const dbUser = await User.findOne({ email: user.email });

        const { accessToken, refreshToken } =
            await generateAccessAndRefreshToken(dbUser._id);

        dbUser.refreshToken = refreshToken;

        const session = await Session.create({
            token: accessToken,
            associate: dbUser.email,
        });

        if (!session) {
            return res
                .status(500)
                .json(new ApiError(500, "Failed to create session token."));
        }

        const clientUrl = conf.clientUrl;
        // const clientUrl = clientUrlProduction;

        return res.redirect(
            `${clientUrl}/google-auth-success?accessToken=${encodeURIComponent(
                accessToken
            )}&refreshToken=${encodeURIComponent(refreshToken)}`
        );
    } catch (error) {
        console.error("Internal Server Error:", error);
        return res
            .status(500)
            .json(new ApiError(500, "Server error during login success"));
    }
};

export const refreshToken = async (req, res) => {
    try {
        const user = req.user;

        if (!user) {
            return res
                .status(401)
                .json(new ApiError(401, "User not authenticated."));
        }

        const newAccessToken = await user.generateAccessToken();

        if (!newAccessToken) {
            return res
                .status(500)
                .json(
                    new ApiError(500, "Failed to generate new access token.")
                );
        }

        const session = await Session.create({
            token: newAccessToken,
            associate: user.email,
        });

        if (!session) {
            return res
                .status(500)
                .json(new ApiError(500, "Failed to create session token."));
        }

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    { accessToken: newAccessToken },
                    "Access token refreshed successfully."
                )
            );
    } catch (error) {
        console.error("Internal Server Error:", error);
        return res
            .status(500)
            .json(new ApiError(500, "Server error renewing access token."));
    }
};

export const logoutUser = async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return res
                .status(401)
                .json(new ApiError(401, "User not authenticated."));
        }

        const dbuser = await User.findById(user._id);

        if (!dbuser) {
            return res.status(404).json(new ApiError(404, "User not found."));
        }

        // Remove the refresh token from the user
        dbuser.refreshToken = "";
        await dbuser.save({ validateBeforeSave: false });

        //delete all sessios associated with the user email
        await Session.deleteMany({ associate: dbuser.email });

        return res
            .status(200)
            .json(new ApiResponse(200, {}, "Logged out successfully."));
    } catch (error) {
        console.log("Logout Error:", error);
        return res
            .status(500)
            .json(new ApiError(500, "Server error logging out user."));
    }
};

export const requestForgetPassword = async (req, res) => {
    console.log(req.body);
    try {
        const { email } = req.body;
        if (!email)
            return res
                .status(404)
                .json(new ApiError(404, "Email not provided."));

        const user = await User.findOne({ email });

        if (!user)
            return res
                .status(404)
                .json(new ApiError(404, "User doesnot exist."));

        console.log(user);

        await sendResetPasswordEmail(user);

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    {},
                    "If the email exists, a password reset link has been sent."
                )
            );
    } catch (error) {
        console.log("Reset Password Error:", error);
        return res
            .status(500)
            .json(new ApiError(500, "Server error requesting reset password."));
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;

        const { password } = req.body;

        if (!token)
            return res.status(400).json(new ApiError(400, "Token missing."));

        if (!password)
            return res.status(400).json(new ApiError(400, "Password missing."));

        const decoded = jwt.verify(token, conf.emailSecret);

        const user = await User.findById(decoded.id);

        const isOldPassword = await user.isPasswordCorrect(password);

        if (isOldPassword) {
            return res
                .status(400)
                .json(
                    new ApiError(
                        400,
                        "This password is same as old, enter a new password."
                    )
                );
        }

        if (!user)
            return res
                .status(404)
                .json(new ApiError(404, "User doesnot exist."));

        user.password = password;
        await user.save();

        return res
            .status(200)
            .json(new ApiResponse(200, {}, "Password changed successfully."));
    } catch (error) {
        console.log("Reset Password Error:", error);
        return res
            .status(500)
            .json(new ApiError(500, "Server error reseting password."));
    }
};
