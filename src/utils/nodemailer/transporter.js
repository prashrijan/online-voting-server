import nodemailer from "nodemailer";
import { conf } from "../../conf/conf.js";

export const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: conf.emailUser,
        pass: conf.emailPass,
    },
});
