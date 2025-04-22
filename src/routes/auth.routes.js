import express from "express";
import {
    loginSuccess,
    loginUser,
    refreshToken,
    registerUser,
    verifyEmail,
} from "../controllers/auth.controller.js";
import passport from "../google-auth-app/config/passportConfig.js";
import { refreshAuthenticate } from "../middlewares/authenticateUser.js";

const router = express.Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/verify-email").get(verifyEmail);

// route to start google login
router
    .route("/google")
    .get(passport.authenticate("google", { scope: ["profile", "email"] }));

// google callback route
router.route("/google/callback").get(
    passport.authenticate("google", {
        failureRedirect: "/",
    }),
    loginSuccess
);

router.route("/refresh-token").get(refreshAuthenticate, refreshToken);

export default router;
