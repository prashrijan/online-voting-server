import nodemailer from "nodemailer";
import { conf } from "../../conf/conf.js";

export const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: conf.emailUser,
        // Google displays app passwords in groups; whitespace is formatting only.
        pass: conf.emailPass?.replace(/\s/g, ""),
    },
});
