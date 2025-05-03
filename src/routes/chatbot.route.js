import express from "express";
import { chatbotController } from "../controllers/chatbot.controller.js";

const router = express.Router();

router.route("/message").post(chatbotController);

export default router;
