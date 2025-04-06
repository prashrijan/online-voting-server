import express from "express";
import { authenticateuser, isAdmin } from "../middlewares/authenticateUser.js";
import { createElection } from "../controllers/election.controller.js";
import { electionValidatior } from "../middlewares/validation/election/election.validate.js";

const router = express.Router();

// private route (only admin)
// create election
router
    .route("/")
    .post(authenticateuser, isAdmin, electionValidatior, createElection);

export default router;
