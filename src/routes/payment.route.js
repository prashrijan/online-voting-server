import express from "express";
import { createCheckoutSession } from "../controllers/payment.controller.js";
import { authenticateuser } from "../middlewares/authenticateUser.js";

const router = express.Router();

router
    .route("/create-checkout-session")
    .post(authenticateuser, createCheckoutSession);

export default router;
