import express from "express";
import { authenticateuser, isAdmin } from "../middlewares/authenticateUser.js";
import {
    castVote,
    getElectionResults,
    checkVoteStatus,
    getLiveVoteData,
    getVoterCounts,
    getMyVotes,
} from "../controllers/vote.controller.js";

const router = express.Router();

router.route("/").post(authenticateuser, castVote);
router.route("/my-votes").get(authenticateuser, getMyVotes);

router.route("/results/:id").get(authenticateuser, isAdmin, getElectionResults);

router
    .route("/checkVoteStatus/:electionId")
    .get(authenticateuser, checkVoteStatus);

router.route("/:electionId/live").get(authenticateuser, getLiveVoteData);

router.route("/get-voters-count/:electionId").get(getVoterCounts);

export default router;
