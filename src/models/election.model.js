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
            _id: {
                type: Schema.Types.ObjectId,
                required: true,
                ref: "User",
            },
            email: {
                type: String,
                required: true,
            },
            fullName: {
                type: String,
                required: true,
            },
        },
        chunaabCode: {
            type: String,
        },
        coverImage: {
            type: String,
        },
        visibility: {
            type: String,
            enum: ["public", "private"],
            default: "private",
        },
        timezone: {
            type: String,
            required: true,
            default: "UTC",
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

    console.log(pendingElections);

    for (const election of pendingElections) {
        const start = combineDateTime(
            election.startDate,
            election.startTime,
            election.timezone
        );
        console.log(start);
        console.log(now);

        if (now >= start) {
            console.log("Starting Election");
            election.status = "active";
            await election.save();
        }
    }

    const activeElections = await this.find({ status: "active" });

    for (const election of activeElections) {
        const end = combineDateTime(
            election.endDate,
            election.endTime,
            election.timezone
        );
        if (now >= end) {
            console.log("ending election");
            election.status = "finished";
            await election.save();
        }
    }
};

// method to update privacy of the election
electionSchema.methods.updatePrivacy = function () {
    this.visibility = this.visibility === "private" ? "public" : "private";
    return this.save();
};

export const Election = new mongoose.model("Election", electionSchema);
