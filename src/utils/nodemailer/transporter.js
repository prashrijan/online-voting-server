import nodemailer from "nodemailer";
import { conf } from "../../conf/conf.js";

export const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    auth: {
        user: conf.emailUser,
        pass: conf.emailPass,
    },
});
