import mongoose, { Schema } from "mongoose";
import { combineDateTime } from "../utils/others/combineDateTime.js";

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
        startTime: {
            type: String,
            required: true,
        },
        endTime: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ["pending", "active", "finished", "closed"],
            default: "pending",
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

// method to mark the election as active if the startDate has passed
electionSchema.methods.startElection = function () {
    const startDate = combineDateTime(this.startDate, this.startTime);
    if (startDate <= new Date()) {
        this.status = "active";
        return this.save();
    } else {
        throw new Error("Cannot start election before the start date.");
    }
};

// method to mark the election as finished after endDate
electionSchema.methods.endElection = function () {
    const endDate = combineDateTime(this.endDate, this.endTime);
    if (endDate <= new Date()) {
        this.status = "finished";
        return this.save();
    } else {
        throw new Error("Cannot end election before the end date.");
    }
};

// method to close the election manually (by admin)
electionSchema.methods.closeElection = function () {
    if (this.status !== "closed") {
        this.status = "closed";
        return this.save();
    } else {
        throw new Error("Election is already closed.");
    }
};

// method to auto update election status based on start date and end datr
electionSchema.statics.updateElectionStatus = async function () {
    const now = new Date();

    const pendingElections = await this.find({ status: "pending" });

    for (const election of pendingElections) {
        const start = combineDateTime(election.startDate, election.startTime);

        if (now >= start) {
            election.status = "active";
            await election.save();
        }
    }

    const activeElections = await this.find({ status: "active" });

    for (const election of activeElections) {
        const end = combineDateTime(election.endDate, election.endTime);
        if (now >= end) {
            election.status = "finished";
            await election.save();
        }
    }
};

export const Election = new mongoose.model("Election", electionSchema);
