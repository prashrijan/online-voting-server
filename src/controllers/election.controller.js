import { ApiError } from "../utils/customResponse/ApiError.js";
import { ApiResponse } from "../utils/customResponse/ApiResponse.js";
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

export const getElections = async (req, res, next) => {
    try {
        const election = await Election.find();

        if (!election) {
            return res
                .status(404)
                .json(new ApiError(404, "No elections were found."));
        }

        return res
            .status(200)
            .json(
                new ApiResponse(200, election, "Elections found successfully.")
            );
    } catch (error) {
        console.error(`Internal Server Error : ${error}`);
        return next(new ApiError(500, "Server error getting elections."));
    }
};

export const getElection = async (req, res, next) => {
    try {
        const id = req.params.id;

        if (!id) {
            return res
                .status(400)
                .json(
                    new ApiError(
                        400,
                        "Id is required for fetching the election data."
                    )
                );
        }

        const election = await Election.findById(id);

        if (!election) {
            return res
                .status(404)
                .json(new ApiError(404, "Election not found."));
        }

        return res
            .status(200)
            .json(
                new ApiResponse(200, election, "Election found successfully.")
            );
    } catch (error) {
        console.error(`Internal Server Error : ${error}`);
        return next(new ApiError(500, "Server error getting election."));
    }
};
