import { ApiError } from "../utils/customResponse/ApiError.js";
import { Election } from "../models/election.model.js";

export const createElection = async (req, res, next) => {
    try {
        const { title, startDate, endDate, candidate } = req.body;

        if (!title || !startDate || !endDate || !candidate) {
            return res
                .status(400)
                .json(new ApiError(400, "All fields are required"));
        }

        const candidates = Array.isArray(candidate) ? candidate : [candidate];

        if (new Date(startDate) >= new Date(endDate)) {
            return res
                .status(400)
                .json(new ApiError(400, "Start date must be before end date."));
        }

        const election = await Election.create({
            title,
            startDate,
            endDate,
            candidates,
            createdBy: req.user?._id,
        });
        await election.save();

        return res.status(201).json({
            success: true,
            message: "Election created successfully",
            data: election,
        });
    } catch (error) {
        console.error(`Internal Server Error : ${error}`);
        return next(new ApiError(500, "Server error creating election."));
    }
};
