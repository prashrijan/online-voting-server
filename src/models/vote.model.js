import mongoose, { Schema } from "mongoose";

const voteSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        electionId: {
            type: Schema.Types.ObjectId,
            ref: "Election",
            required: true,
        },
        candidateId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    { timestamps: true }
);

voteSchema.index({ userId: 1, electionId: 1 }, { unique: true });

export const Vote = new mongoose.model("Vote", voteSchema);
