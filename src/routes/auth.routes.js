import express from "express";
import {
    loginSuccess,
    loginUser,
    registerUser,
} from "../controllers/auth.controller.js";
import passport from "../google-auth-app/config/passportConfig.js";

const router = express.Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);

// route to start google login
router
    .route("/google")
    .get(passport.authenticate("google", { scope: ["profile", "email"] }));

// google callback route
router
    .route("/google/callback")
    .get(
        passport.authenticate("google", { failureRedirect: "/" }),
        loginSuccess
    );

export default router;
