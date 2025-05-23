import jwt from "jsonwebtoken";
import { conf } from "../../conf/conf.js";
import { transporter } from "./transporter.js";

export const sendVerificationEmail = async (user) => {
    if (!user || !user.email) {
        throw new Error("No email provided.");
    }
    const token = jwt.sign(
        {
            id: user._id,
            email: user.email,
            type: "email-verification",
        },
        conf.emailSecret,
        {
            expiresIn: "1d",
        }
    );

    const url = `${conf.clientUrl}/verify-email?token=${token}`;

    const mailOptions = {
        from: `"Chunaab 👋" <${conf.emailUser}>`,
        to: user.email,
        subject: "Verify your email",
        html: `
          <p>Hi ${user.fullName || "there"},</p>
          <p>Thanks for signing up for Chunaab!</p>
          <p>Please click the link below to verify your email:</p>
          <button><a href="${url}" style="padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none;">Verify Email</a></button>
          <p>Or copy & paste this link in your browser:</p>
          <p>${url}</p>
          <br />
          <p>This link will expire in 24 hours.</p>
        `,
        text: `Please verify your email by visiting this link: ${url}`,
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error("Error sending verification email:", error.message);
        throw new Error("Failed to send verification email");
    }
};
