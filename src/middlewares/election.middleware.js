import { Election } from "../models/election.model.js";
import { ApiError } from "../utils/customResponse/ApiError.js";

export const limitElectionCreation = async (req, res, next) => {
    try {
        const userId = req.user?._id;

        if (!userId) {
            return res
                .status(400)
                .json(new ApiError(400, "Please authenticate the user."));
        }

        const now = new Date();
        const startOfDay = new Date(now.setHours(0, 0, 0, 0));
        const endOfDay = new Date(now.setHours(23, 59, 59, 999));

        const electionCount = await Election.countDocuments({
            createdBy: userId,
            createdAt: { $gte: startOfDay, $lte: endOfDay },
        });

        if (electionCount >= 2) {
            return res
                .status(403)
                .json(
                    new ApiError(
                        403,
                        "You can only create 2 elections per day."
                    )
                );
        }

        next();
    } catch (error) {
        console.error("Election limit check failed: ", error);
        return res.status(500).json(new ApiError(500, "Internal Server Error"));
    }
};
