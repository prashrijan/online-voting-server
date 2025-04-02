import mongoose, { Schema } from "mongoose";

const sessionSchema = new Schema(
    {
        token: {
            type: String,
            required: true,
        },
        expiresIn: {
            type: Date,
            default: () => new Date(Date.now() + 15 * 60 * 1000),
            index: { expires: 0 },
        },
        associate: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

export const Session = new mongoose.model("Session", sessionSchema);
