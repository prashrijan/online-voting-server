import { User } from "../models/user.model.js";
import { ApiError } from "../utils/customResponse/ApiError.js";
import { ApiResponse } from "../utils/customResponse/ApiResponse.js";

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
