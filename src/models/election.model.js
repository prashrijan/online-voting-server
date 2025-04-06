import mongoose, { Schema } from "mongoose";

const electionSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
        },
        startDate: {
            type: Date,
            required: true,
        },
        endDate: {
            type: Date,
            required: true,
        },
        candidates: [
            {
                type: Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
    },
    { timestamps: true }
);

export const Election = new mongoose.model("Election", electionSchema);
