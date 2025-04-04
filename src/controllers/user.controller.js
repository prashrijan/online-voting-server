import { ApiError } from "../utils/customResponse/ApiError.js";
import { ApiResponse } from "../utils/customResponse/ApiResponse.js";

export const fetchUser = async (req, res) => {
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
