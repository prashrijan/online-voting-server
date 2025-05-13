import mongoose, { Mongoose } from "mongoose";
import { Election } from "../models/election.model.js";
import { Vote } from "../models/vote.model.js";
import { ApiError } from "../utils/customResponse/ApiError.js";
import { ApiResponse } from "../utils/customResponse/ApiResponse.js";
import { User } from "../models/user.model.js";

// cast a vote
export const castVote = async (req, res, next) => {
    try {
        const { electionId, candidateId } = req.body;
        const userId = req.user?.id;

        if (!electionId || !candidateId) {
            return res
                .status(400)
                .json(new ApiError(400, "All fields are required."));
        }

        const election = await Election.findById(electionId);

        if (!election || election.status != "active") {
            return res
                .status(400)
                .json(new ApiError(400, "Election is not active."));
        }

        if (!election.candidates.includes(candidateId)) {
            return res
                .status(400)
                .json(new ApiError("Invalid Candidate for this election."));
        }

        const existingVote = await Vote.findOne({ userId, electionId });

        if (existingVote) {
            return res
                .status(400)
                .json(
                    new ApiError(
                        400,
                        "You have already voted for this election."
                    )
                );
        }

        const vote = await Vote.create({ userId, electionId, candidateId });

        return res
            .status(201)
            .json(new ApiResponse(201, vote, "Vote casted successfully."));
    } catch (error) {
        console.error(`Internal Server Error : ${error}`);
        return next(
            new ApiError(500, "Server error casting vote to election.")
        );
    }
};

// publish result
export const getElectionResults = async (req, res, next) => {
    try {
        const electionId = req.params.id;

        const election = await Election.findById(electionId);

        if (election.status === "active") {
            return res
                .status(404)
                .json(
                    new ApiError(
                        400,
                        "Election is still acitve. Cannot get active election results."
                    )
                );
        }

        const totalVotes = await Vote.countDocuments({ electionId });

        const results = await Vote.aggregate([
            {
                $match: {
                    electionId: new mongoose.Types.ObjectId(
                        electionId.toString()
                    ),
                },
            },
            {
                $group: {
                    _id: "$candidateId",
                    voteCount: { $sum: 1 },
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "candidateId",
                    foreignField: "_id",
                    as: "candidate",
                },
            },
            {
                $unwind: {
                    path: "$candidate",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $project: {
                    _id: 0,
                    candidateId: "$_id",
                    voteCount: 1,
                    percentage: {
                        $round: [
                            {
                                $multiply: [
                                    { $divide: ["$voteCount", totalVotes] },
                                    100,
                                ],
                            },
                            2,
                        ],
                    },
                },
            },
            {
                $sort: { voteCount: -1 },
            },
        ]);

        const candidateIds = results.map((result) => result.candidateId);

        const candidates = await User.find({
            _id: { $in: candidateIds },
        });

        const resultsWithNames = results.map((result) => {
            const candidate = candidates.find(
                (c) => c._id.toString() === result.candidateId.toString()
            );
            return {
                ...result,
                name: candidate ? candidate.fullName : "Unknown", // Add candidate name
            };
        });

        const maxVotes = resultsWithNames[0]?.voteCount || 0;

        const winners = resultsWithNames.filter(
            (r) => r.voteCount === maxVotes
        );

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    { totalVotes, resultsWithNames, winners },
                    "Election Result Fetched Successfully."
                )
            );
    } catch (error) {
        console.error(`Internal Server Error : ${error}`);
        return next(new ApiError(500, "Server error publishing results."));
    }
};

export const checkVoteStatus = async (req, res, next) => {
    try {
        const { electionId } = req.params;
        const userId = req.user?._id;

        if (!electionId) {
            return res
                .status(404)
                .json(new ApiError(404, "Election id missing."));
        }

        let vote = await Vote.find({
            electionId,
            userId,
        });

        const hasVoted = vote.length > 0;

        return res
            .status(200)
            .json(new ApiResponse(200, hasVoted, "Vote status checked."));
    } catch (error) {
        console.error(`Internal Server Error : ${error}`);
        return next(new ApiError(500, "Server error checking voting status."));
    }
};

export const getLiveVoteData = async (req, res) => {
    const { electionId } = req.params;

    try {
        const votes = await Vote.aggregate([
            {
                $match: {
                    electionId: new mongoose.Types.ObjectId(electionId),
                },
            },
            {
                $group: {
                    _id: "$candidateId",
                    voteCount: { $sum: 1 },
                },
            },
            {
                $lookup: {
                    from: "users", // candidateId refers to User model
                    localField: "_id",
                    foreignField: "_id",
                    as: "candidate",
                },
            },
            {
                $unwind: "$candidate",
            },
            {
                $project: {
                    candidateId: "$_id",
                    fullName: "$candidate.fullName",
                    voteCount: 1,
                },
            },
            {
                $sort: { voteCount: -1 },
            },
        ]);

        res.status(200).json(
            new ApiResponse(200, votes, "Vote count fetched.")
        );
    } catch (error) {
        console.error("Live vote aggregation error:", error);
        res.status(500).json(new ApiError(500, "Live vote aggregation error"));
    }
};

export const getVoterCounts = async (req, res) => {
    try {
        const { electionId } = req.params;

        const votersInElection = await Vote.countDocuments({ electionId });

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    votersInElection,
                    "Voters count fetched successfully."
                )
            );
    } catch (error) {
        console.error("Getiing vote count error:", error);
        res.status(500).json(new ApiError(500, "Getting voter count error."));
    }
};
