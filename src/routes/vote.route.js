import express from "express";
import { authenticateuser, isAdmin } from "../middlewares/authenticateUser.js";
import {
    castVote,
    getElectionResults,
} from "../controllers/vote.controller.js";

const router = express.Router();

router.route("/").post(authenticateuser, castVote);

router.route("/results/:id").get(authenticateuser, isAdmin, getElectionResults);

export default router;
