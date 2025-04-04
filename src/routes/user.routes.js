import express from "express";
import { authenticateuser } from "../middlewares/authenticateUser.js";
import { fetchUser } from "../controllers/user.controller.js";

const router = express.Router();

// public route to get single user through token
router.route("/").get(authenticateuser, fetchUser);

export default router;
