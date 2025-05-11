import { transporter } from "./transporter.js";
import { conf } from "../../conf/conf.js";

export const sendHelpMessageEmal = async (name, email, subject, message) => {
    try {
        const mailOptions = {
            from: `"${name}" <${email}>`,
            to: conf.emailUser,
            subject: `Support Request: ${subject}`,
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; padding: 20px; border: 1px solid #eee;">
                <h2 style="color: #0066cc;">📩 New Support Request</h2>
                <p><strong>From:</strong> ${name} (<a href="mailto:${email}">${email}</a>)</p>
                <p><strong>Subject:</strong> ${subject}</p>
                <hr style="border: none; border-top: 1px solid #ccc;" />
                <p style="white-space: pre-line;">${message}</p>

                <hr style="border: none; border-top: 1px solid #ccc;" />
                <p style="font-size: 12px; color: #888;">Sent for Chunaab Help Center</p>
                </div>
            `,
        };
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error("Error sending help request message: ", error.message);
        throw new Error("Failed to send help center message.");
    }
};
