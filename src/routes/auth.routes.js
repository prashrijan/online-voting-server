import express from "express";
import {
    loginSuccess,
    loginUser,
    logoutUser,
    refreshToken,
    registerUser,
    requestForgetPassword,
    verifyEmail,
    resetPassword,
} from "../controllers/auth.controller.js";
import passport from "../google-auth-app/config/passportConfig.js";
import {
    authenticateuser,
    refreshAuthenticate,
} from "../middlewares/authenticateUser.js";
import { conf } from "../conf/conf.js";

const router = express.Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/verify-email").post(verifyEmail);

// route to start google login
router
    .route("/google")
    .get(passport.authenticate("google", { scope: ["profile", "email"] }));

// google callback route
router.route("/google/callback").get(
    passport.authenticate("google", {
        failureRedirect: `${conf.clientUrl}/login?error=google-failed`,
        session: false,
    }),
    loginSuccess
);

router.route("/refresh-token").get(refreshAuthenticate, refreshToken);

//logout route
router.route("/logout").get(authenticateuser, logoutUser);

// forgot-password route
router.route("/forget-password").post(requestForgetPassword);

router.route("/reset-password/:token").put(resetPassword);

export default router;
