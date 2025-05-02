import { ApiError } from "../utils/customResponse/ApiError.js";
import { ApiResponse } from "../utils/customResponse/ApiResponse.js";
import { Election } from "../models/election.model.js";
import { generateChunaabCode } from "../utils/others/generateChuaabCode.js";
import { User } from "../models/user.model.js";
import { uploadToCloudinary } from "../utils/cloudinary/uploadToCloudinary.js";

// create election controller
export const createElection = async (req, res, next) => {
    try {
        const {
            title,
            startDate,
            endDate,
            candidate,
            startTime,
            endTime,
            visibility = "private",
        } = req.body;

        const userId = req.user._id;

        if (
            !title ||
            !startDate ||
            !endDate ||
            !candidate ||
            !startTime ||
            !endTime
        ) {
            return res
                .status(400)
                .json(new ApiError(400, "All fields are required"));
        }

        const candidates = Array.isArray(candidate) ? candidate : [candidate];

        console.log(candidates);
        let coverImageUrl;
        if (req.file) {
            coverImageUrl = await uploadToCloudinary(
                req.file.path,
                "chunaab/election-covers"
            );
        } else {
            coverImageUrl =
                "https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
        }

        if (new Date(startTime) >= new Date(endTime)) {
            return res
                .status(400)
                .json(new ApiError(400, "Start time must be before end time."));
        }

        const election = await Election.create({
            title,
            startDate,
            endDate,
            startTime,
            endTime,
            candidates,
            coverImage: coverImageUrl,
            createdBy: req.user?.fullName,
            chunaabCode: generateChunaabCode(),
            visibility,
        });
        await election.save();

        const users = await Promise.all(
            candidates.map(async (candidateId) => {
                return await User.findById(candidateId);
            })
        );

        if (!users) {
            return res
                .status(404)
                .json(new ApiError(404, "Candidates doesnot exist."));
        }

        users.map(async (user) => {
            user.addElection(election._id);
            user.updateRole(election._id, userId);
            await user.save();
        });

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

// get all elections controller
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

// get a single election controller by id
export const getElectionById = async (req, res, next) => {
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

// delete election by id
export const deleteElection = async (req, res, next) => {
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

        const election = await Election.findByIdAndDelete(id);

        if (!election) {
            return res
                .status(404)
                .json(new ApiError(404, "Election not found."));
        }

        return res
            .status(200)
            .json(
                new ApiResponse(200, election, "Election deleted successfully.")
            );
    } catch (error) {
        console.error(`Internal Server Error : ${error}`);
        return next(new ApiError(500, "Server error updating election."));
    }
};

// add candidate/s
export const addCandidateToElection = async (req, res, next) => {
    try {
        const electionId = req.params.id;
        const { candidateId } = req.body;

        // check if the request body is an array or a single candidate
        const candidatesToAdd = Array.isArray(candidateId)
            ? candidateId
            : [candidateId];

        const election = await Election.findById(electionId);
        if (!election) {
            return res
                .status(404)
                .json(new ApiError(404, "Election not found."));
        }

        const existingCandidates = election.candidates.map((candidate) =>
            candidate.toString()
        );

        const newCandidates = candidatesToAdd.filter(
            (candidateToAdd) => !existingCandidates.includes(candidateToAdd)
        );

        if (newCandidates.length === 0) {
            return res
                .status(400)
                .json(
                    new ApiError(
                        400,
                        "Candidates already added to this election."
                    )
                );
        }

        election.candidates.push(...newCandidates);
        await election.save();

        return res
            .status(200)
            .json(
                new ApiResponse(200, election, "Candidates added successfully.")
            );
    } catch (error) {
        console.error(`Internal Server Error : ${error}`);
        return next(
            new ApiError(500, "Server error adding candidate to  election.")
        );
    }
};

// delete candidate/s
export const deleteCandidateFromElection = async (req, res, next) => {
    try {
        const electionId = req.params.id;
        const { candidateId } = req.body;

        const candidatesToDelete = Array.isArray(candidateId)
            ? candidateId
            : [candidateId];

        const election = await Election.findById(electionId);
        if (!election)
            return res
                .status(404)
                .json(new ApiError(404, "Election not found."));

        const existingCandidates = election.candidates.map((candidate) =>
            candidate.toString()
        );

        const deletedCandidate = candidatesToDelete.filter(
            (candidateToDelete) =>
                existingCandidates.includes(candidateToDelete)
        );

        console.log(deletedCandidate);

        if (deletedCandidate.length === 0) {
            return res
                .status(400)
                .json(
                    new ApiError(
                        400,
                        "Candidate doesnot exist in this election"
                    )
                );
        }

        election.candidates = election.candidates.filter(
            (candidate) => !deletedCandidate.includes(candidate.toString())
        );

        console.log(election.candidates);

        await election.save();

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    election,
                    "Candidate(s) removed successfully."
                )
            );
    } catch (error) {
        console.error(`Internal Server Error : ${error}`);
        return next(new ApiError(500, "Server error deleting election."));
    }
};

// update election
export const updateElection = async (req, res, next) => {
    try {
        const id = req.params.id;

        if (!id) return res.status(400).json(new ApiError("Id is required."));
        const updates = req.body;

        if (Object.keys(updates).length === 0)
            return res
                .status(400)
                .json(new ApiError(400, "Please enter an update to continue."));

        if ("candidates" in updates) {
            return res
                .status(400)
                .json(
                    new ApiError(400, "Candidates must be updated separately.")
                );
        }

        const election = await Election.findByIdAndUpdate(id, updates, {
            new: true,
        });

        if (!election) {
            return res
                .status(404)
                .json(new ApiError(404, "Election not found."));
        }

        return res
            .status(200)
            .json(
                new ApiResponse(200, election, "Election updated successfully.")
            );
    } catch (error) {
        console.error(`Internal Server Error : ${error}`);
        return next(new ApiError(500, "Server error updating election."));
    }
};

// get chunaab code
export const getElectionByCode = async (req, res, next) => {
    try {
        const chunaabCode = req.params.code;

        console.log(req.params);

        if (!chunaabCode) {
            return res
                .status(400)
                .json(new ApiError(400, "Please enter the code to continue."));
        }

        const election = await Election.findOne({ chunaabCode });

        if (!election) {
            return res
                .status(404)
                .json(new ApiError(404, "No election found."));
        }

        return res
            .status(200)
            .json(
                new ApiResponse(200, election, "Election found successfully.")
            );
    } catch (error) {
        console.error(`Internal Server Error : ${error}`);
        return next(
            new ApiError(500, "Server error getting election by code.")
        );
    }
};

// update privacy
export const updateElectionVisibility = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { visibility } = req.body;

        console.log(req.body);

        if (!["public", "private"].includes(visibility)) {
            return res
                .status(400)
                .json(new ApiError(400, "Invalid visibility option."));
        }

        const election = await Election.findByIdAndUpdate(
            id,
            { visibility },
            { new: true }
        );
        if (!election) {
            return res
                .status(404)
                .json(new ApiError(404, "Election not found."));
        }

        return res
            .status(200)
            .json(
                new ApiResponse(200, election, "Election visibility updated.")
            );
    } catch (error) {
        console.error(`Internal Server Error : ${error}`);
        return next(
            new ApiError(500, "Server error updating election visibility.")
        );
    }
};
