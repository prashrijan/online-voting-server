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
    if (this.startDate <= new Date()) {
        this.status = "active";
        return this.save();
    } else {
        throw new Error("Cannot start election before the start date.");
    }
};

// method to mark the election as finished after endDate
electionSchema.methods.endElection = function () {
    if (this.endDate <= new Date()) {
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
        if (now >= election.startDate) {
            election.status = "active";
            await election.save();
        }
    }

    const activeElections = await this.find({ status: "active" });

    for (const election of activeElections) {
        if (now >= election.endDate) {
            election.status = "finished";
            await election.save();
        }
    }
};

export const Election = new mongoose.model("Election", electionSchema);
