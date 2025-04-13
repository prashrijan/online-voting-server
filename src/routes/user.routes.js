import express from "express";
import { authenticateuser, isAdmin } from "../middlewares/authenticateUser.js";
import {
    approveOrRejectSlogan,
    fetchUser,
    getPendingStatusSloganRequests,
    requestSloganUpdate,
} from "../controllers/user.controller.js";

const router = express.Router();

router.route("/").get(authenticateuser, fetchUser);
router.route("/request-slogan").post(authenticateuser, requestSloganUpdate);
router
    .route("/approve-reject-slogan")
    .post(authenticateuser, isAdmin, approveOrRejectSlogan);

router
    .route("/get-pending-slogan-requests")
    .get(authenticateuser, isAdmin, getPendingStatusSloganRequests);

export default router;
