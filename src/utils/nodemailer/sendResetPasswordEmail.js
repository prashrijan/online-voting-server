import jwt from "jsonwebtoken";
import { conf } from "../../conf/conf.js";
import { transporter } from "./transporter.js";

export const sendResetPasswordEmail = async (user) => {
    if (!user || !user.email) {
        throw new Error("No email provided.");
    }
    const token = jwt.sign(
        {
            id: user._id,
            email: user.email,
            type: "password-reset",
        },
        conf.emailSecret,
        {
            expiresIn: "1h",
        }
    );

    // const url = `${conf.clientUrl}/reset-password/${token}`;
    const url = `${conf.clientUrlProduction}/reset-password/${token}`;

    const mailOptions = {
        from: `"Chunaab 🔐" <${conf.emailUser}>`,
        to: user.email,
        subject: "Reset Your Password",
        html: `
        <p>Hi ${user.fullName || "there"},</p>
        <p>You requested to reset your password. Click the link below to proceed:</p>
        <p><a href="${url}" style="padding: 10px 20px; background-color: #dc3545; color: white; text-decoration: none;">Reset Password</a></p>
        <p>Or copy & paste this link into your browser:</p>
        <p>${url}</p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn’t request this, you can ignore this email.</p>
        `,
        text: `Reset your password using this link: ${url}`,
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error("Error sending reset password email:", error.message);
        throw new Error("Failed to send reset password email");
    }
};
