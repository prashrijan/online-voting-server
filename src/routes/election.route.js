import express from "express";
import { authenticateuser, isAdmin } from "../middlewares/authenticateUser.js";
import {
    createElection,
    getElections,
    getElectionById,
    deleteElection,
    addCandidateToElection,
    deleteCandidateFromElection,
    updateElection,
    getElectionByCode,
} from "../controllers/election.controller.js";
import { electionValidatior } from "../middlewares/validation/election/election.validate.js";
import { limitElectionCreation } from "../middlewares/election.middleware.js";
import { upload } from "../middlewares/multerUpload.js";

const router = express.Router();

// public routes
router.route("/").get(getElections);

router.route("/id/:id").get(getElectionById);

router.route("/code/:code").get(getElectionByCode);

// private route (only admin)
// create election
router
    .route("/")
    .post(
        authenticateuser,
        limitElectionCreation,
        upload.single("coverImage"),
        electionValidatior,
        createElection
    );

router.route("/delete/:id").delete(authenticateuser, isAdmin, deleteElection);

router
    .route("/:id/add-candidate")
    .post(authenticateuser, isAdmin, addCandidateToElection);
router
    .route("/:id/delete-candidate")
    .delete(authenticateuser, isAdmin, deleteCandidateFromElection);
router.route("/:id").put(authenticateuser, isAdmin, updateElection);

export default router;
