import { User } from "../models/user.model.js";

import { ApiError } from "../utils/customResponse/ApiError.js";
import { ApiResponse } from "../utils/customResponse/ApiResponse.js";
import { uploadToCloudinary } from "../utils/cloudinary/uploadToCloudinary.js";
import { sendHelpMessageEmal } from "../utils/nodemailer/sendHelpMessageEmail.js";

export const fetchUser = async (req, res, next) => {
    try {
        const user = req.user;

        if (!user) {
            return res.status(404).json(new ApiError(404, "User not found."));
        }

        res.status(200).json(
            new ApiResponse(200, user, "User found successfully.")
        );
    } catch (error) {
        console.error(`Internal Server Error : ${error}`);
        return next(new ApiError(500, "Server error fetching user."));
    }
};

export const requestSloganUpdate = async (req, res, next) => {
    try {
        const { electionId, slogan } = req.body;
        const userId = req.user?._id;

        const user = await User.findById(userId);

        if (!userId)
            return res.status(404).json(new ApiError(404, "User not found."));

        user.requestSlogan(electionId, slogan);
        await user.save();

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    user,
                    "Slogan request submitted successfully."
                )
            );
    } catch (error) {
        console.error(`Internal Server Error : ${error}`);
        return next(
            new ApiError(500, "Server error requesting slogan update.")
        );
    }
};

export const approveOrRejectSlogan = async (req, res, next) => {
    try {
        const { userId, electionId, status } = req.body;

        if (!["Approved", "Rejected"].includes(status)) {
            return next(
                new ApiError(400, "Status must be 'Approved' or 'Rejected'.")
            );
        }

        const user = await User.findById(userId);
        if (!user) {
            return next(new ApiError(404, "User not found."));
        }

        user.updateSloganStatus(electionId, status);
        await user.save();

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    user,
                    `Slogan has been ${status.toLowerCase()}.`
                )
            );
    } catch (error) {
        console.error(`Internal Server Error : ${error}`);
        return next(new ApiError(500, "Server error updating slogan."));
    }
};

export const getPendingStatusSloganRequests = async (req, res, next) => {
    try {
        const users = await User.find({
            "electionsParticipated.sloganStatus": "Pending",
        }).select("fullName email electionsParticipated");

        console.log(users);
        const pendingRequests = users.flatMap((user) =>
            user.electionsParticiapted
                .filter((e) => e.sloganStaus === "Pending")
                .map((e) => ({
                    userId: user._id,
                    fullName: user.fullName,
                    email: user.email,
                    electionId: e.electionId,
                    slogan: e.slogan,
                }))
        );

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    pendingRequests,
                    "Penidng Slgan Requests Fetched Successfully."
                )
            );
    } catch (error) {
        console.error(`Internal Server Error : ${error}`);
        return next(new ApiError(500, "Server error getting pending status."));
    }
};

export const updateProfile = async (req, res, next) => {
    try {
        const userId = req.user._id;

        const { fullName } = req.body;

        const updates = {};

        if (fullName) updates.fullName = fullName;

        if (req.file) {
            const imageUrl = await uploadToCloudinary(
                req.file.path,
                "chunaab/users-profile"
            );
            updates.profileImage = imageUrl;
        }

        const updateUser = await User.findByIdAndUpdate(userId, updates, {
            new: true,
        });

        if (!updateUser) {
            return res
                .status(400)
                .json(new ApiError(400, "Error updating the profile."));
        }

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    updateUser,
                    "Profile Updated Successfully."
                )
            );
    } catch (error) {
        console.error(`Internal Server Error : ${error}`);
        return next(
            new ApiError(500, "Server error updating profile picture.")
        );
    }
};

export const fetchAllUser = async (req, res, next) => {
    try {
        const users = await User.find({ isVerified: true });

        if (!users) {
            return res.status(404).json(new ApiError(404, "Users not found."));
        }

        return res
            .status(200)
            .json(new ApiResponse(200, users, "Users found successfully."));
    } catch (error) {
        console.error(`Internal Server Error : ${error}`);
        return next(new ApiError(500, "Server error fetching all the users."));
    }
};

export const sendHelpMessage = async (req, res, next) => {
    try {
        const { name, email, subject, message } = req.body;

        if (!name || !email || !subject || !message) {
            return res
                .status(400)
                .json(new ApiError(400, "All fields required."));
        }

        const mail = await sendHelpMessageEmal(name, email, subject, message);

        return res
            .status(200)
            .json(
                new ApiResponse(200, mail, "Thank you for contacting Chunaab.")
            );
    } catch (error) {
        console.error(`Internal Server Error : ${error}`);
        return next(new ApiError(500, "Server error sending help message."));
    }
};
