import express from "express";
import { authenticateuser, isAdmin } from "../middlewares/authenticateUser.js";
import {
    approveOrRejectSlogan,
    fetchAllUser,
    fetchUser,
    getPendingStatusSloganRequests,
    requestSloganUpdate,
    updateProfile,
    sendHelpMessage,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multerUpload.js";

const router = express.Router();

router.route("/users").get(authenticateuser, fetchAllUser);

router.route("/").get(authenticateuser, fetchUser);
router.route("/request-slogan").post(authenticateuser, requestSloganUpdate);
router
    .route("/approve-reject-slogan")
    .post(authenticateuser, isAdmin, approveOrRejectSlogan);

router
    .route("/get-pending-slogan-requests")
    .get(authenticateuser, isAdmin, getPendingStatusSloganRequests);

router
    .route("/update-profile")
    .put(authenticateuser, upload.single("profileImage"), updateProfile);

router.route("/help").post(sendHelpMessage);

export default router;
